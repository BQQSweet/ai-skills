import { InternalServerErrorException } from '@nestjs/common';
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
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'redis') {
        return { host: '127.0.0.1', port: 6379 };
      }

      if (key === 'jwt.refreshExpiresIn') {
        return '7d';
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
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
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
});
