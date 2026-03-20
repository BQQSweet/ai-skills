import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import * as defaultAvatarLibrary from './default-avatar-library';

const mockRedisClient = {
  ttl: jest.fn(),
  setex: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};
const mockBcryptHash = jest.fn();

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockRedisClient),
}));

jest.mock('bcryptjs', () => ({
  __esModule: true,
  hash: (...args: unknown[]) => mockBcryptHash(...args),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    groupMember: {
      findMany: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'redis') {
        return { host: '127.0.0.1', port: 6379 };
      }

      if (key === 'jwt.refreshExpiresIn') {
        return '7d';
      }

      if (key === 'jwt.secret') {
        return 'test-secret';
      }

      return undefined;
    }),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    service = new AuthService(
      prisma as any,
      jwtService as JwtService,
      configService as ConfigService,
    );

    mockRedisClient.get.mockResolvedValue('123456');
    mockRedisClient.del.mockResolvedValue(1);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.groupMember.findMany.mockResolvedValue([]);
    jwtService.signAsync.mockImplementation((payload: { tokenType?: string }) =>
      Promise.resolve(
        payload?.tokenType === 'refresh' ? 'refresh-token' : 'access-token',
      ),
    );
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      tokenType: 'refresh',
    });
    mockBcryptHash.mockResolvedValue('hashed-password');
  });

  it('assigns an avatar from the default avatar library on register', async () => {
    jest
      .spyOn(defaultAvatarLibrary, 'pickRandomDefaultAvatarPath')
      .mockReturnValue('/uploads/default-avatars/chef-avatar-03.svg');
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      phone: '13800138000',
      nickname: '小厨',
      avatar_url: '/uploads/default-avatars/chef-avatar-03.svg',
      role: 'user',
      preferences: null,
      created_at: new Date('2026-03-19T08:00:00.000Z'),
    });

    const result = await service.register({
      phone: '13800138000',
      code: '123456',
      password: 'password123',
      nickname: '小厨',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        phone: '13800138000',
        password_hash: 'hashed-password',
        nickname: '小厨',
        avatar_url: '/uploads/default-avatars/chef-avatar-03.svg',
      },
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, {
      sub: 'user-1',
      phone: '13800138000',
      role: 'user',
      tokenType: 'access',
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      {
        sub: 'user-1',
        tokenType: 'refresh',
      },
      {
        expiresIn: '7d',
      },
    );
    expect(result.user.avatarUrl).toBe(
      '/uploads/default-avatars/chef-avatar-03.svg',
    );
  });

  it('fails loudly when the default avatar library is unavailable', async () => {
    jest
      .spyOn(defaultAvatarLibrary, 'pickRandomDefaultAvatarPath')
      .mockImplementation(() => {
        throw new InternalServerErrorException(
          '默认头像库未配置，请联系管理员',
        );
      });

    await expect(
      service.register({
        phone: '13800138001',
        code: '123456',
        password: 'password123',
        nickname: '小厨二号',
      }),
    ).rejects.toThrow('默认头像库未配置，请联系管理员');

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('refreshes token pair with a valid refresh token', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      phone: '13800138000',
      role: 'user',
    });

    const result = await service.refreshToken({
      refreshToken: 'valid-refresh-token',
    });

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh-token', {
      secret: 'test-secret',
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, {
      sub: 'user-1',
      phone: '13800138000',
      role: 'user',
      tokenType: 'access',
    });
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      {
        sub: 'user-1',
        tokenType: 'refresh',
      },
      {
        expiresIn: '7d',
      },
    );
    expect(result).toEqual({
      token: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('accepts legacy refresh token payloads without tokenType', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      phone: '13800138000',
      role: 'user',
    });

    const result = await service.refreshToken({
      refreshToken: 'legacy-refresh-token',
    });

    expect(result).toEqual({
      token: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('rejects access tokens passed to refresh', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      phone: '13800138000',
      role: 'user',
      tokenType: 'access',
    });

    await expect(
      service.refreshToken({
        refreshToken: 'access-token',
      }),
    ).rejects.toThrow(new UnauthorizedException('刷新凭证类型不正确'));
  });

  it('rejects invalid refresh tokens', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      service.refreshToken({
        refreshToken: 'expired-refresh-token',
      }),
    ).rejects.toThrow(new UnauthorizedException('刷新凭证已过期或无效'));
  });
});
