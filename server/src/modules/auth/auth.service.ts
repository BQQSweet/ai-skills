import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/common/prisma.service';
import { SendSmsDto, LoginDto, LoginType } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private redisClient: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const redisConfig = this.configService.get('redis');
    this.redisClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
    });
  }

  /**
   * 生成并发送短信验证码 (模拟)
   */
  async sendSmsCode(dto: SendSmsDto): Promise<void> {
    const { phone } = dto;
    // 检查是否已经在冷却中
    const ttl = await this.redisClient.ttl(`auth:code:${phone}`);
    if (ttl > 240) {
      // 限制一分钟内只能发送一次（5分钟有效期，剩下 > 4分钟说明还没过一分钟）
      throw new BadRequestException('验证码发送过于频繁，请稍后再试');
    }

    // 随机生成 6 位验证码
    // const code = Math.floor(100000 + Math.random() * 900000).toString();
    const code = '123456'; // 目前为测试方便，写死为 123456

    // 将验证码存入 Redis，有效期 5 分钟
    await this.redisClient.setex(`auth:code:${phone}`, 300, code);

    // TODO: 真实对接短信平台发送代码
    console.log(`[SMS Simulation] Sending code ${code} to phone ${phone}`);
  }

  /**
   * 统一登录逻辑
   */
  async login(dto: LoginDto): Promise<any> {
    let user;

    if (dto.type === LoginType.CODE) {
      if (!dto.phone || !dto.code) {
        throw new BadRequestException('手机号和验证码不能为空');
      }
      user = await this.verifyCodeAndGetUser(dto.phone, dto.code);
    } else if (dto.type === LoginType.PASSWORD) {
      if (!dto.account || !dto.password) {
        throw new BadRequestException('账号和密码不能为空');
      }
      user = await this.verifyPasswordAndGetUser(dto.account, dto.password);
    }

    if (!user) {
      throw new UnauthorizedException('登录失败，用户状态异常');
    }

    // 签发 Token
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const token = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        expiresIn: this.configService.get<string>(
          'jwt.refreshExpiresIn',
        ) as any,
      },
    );

    // 查询用户的家庭组
    const groupMemberships = await this.prisma.groupMember.findMany({
      where: { user_id: user.id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            invite_code: true,
          },
        },
      },
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.created_at,
      },
      groups: groupMemberships.map((m) => ({
        groupId: m.group.id,
        name: m.group.name,
        inviteCode: m.group.invite_code,
        role: m.role,
      })),
    };
  }

  /**
   * 验证验证码并获取/创建用户
   */
  private async verifyCodeAndGetUser(phone: string, code: string) {
    const storedCode = await this.redisClient.get(`auth:code:${phone}`);
    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('验证码不正确或已过期');
    }

    // 验证成功，删除验证码
    await this.redisClient.del(`auth:code:${phone}`);

    // 查找用户，如果没有则静默注册
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // 生成默认密码、昵称等
      const defaultPassword = await bcrypt.hash('123456', 10);
      user = await this.prisma.user.create({
        data: {
          phone,
          password_hash: defaultPassword,
          nickname: `CM_${phone.slice(-4)}`,
        },
      });
    }

    return user;
  }

  /**
   * 验证密码并获取用户
   */
  private async verifyPasswordAndGetUser(account: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone: account }, // 假设 account 就是 phone
    });

    if (!user) {
      throw new UnauthorizedException('该账号未注册');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('密码错误');
    }

    return user;
  }
}
