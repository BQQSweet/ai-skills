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
import {
  SendSmsDto,
  LoginDto,
  LoginType,
  RegisterDto,
  RefreshTokenDto,
  SmsCodeScene,
} from './dto/auth.dto';
import { pickRandomDefaultAvatarPath } from './default-avatar-library';

const SMS_CODE_TTL_SECONDS = 300;
const SMS_CODE_COOLDOWN_THRESHOLD_SECONDS = 240;
const ACCESS_TOKEN_TYPE = 'access';
const REFRESH_TOKEN_TYPE = 'refresh';

type AccessTokenPayload = {
  sub: string;
  phone: string;
  role: string;
  tokenType: typeof ACCESS_TOKEN_TYPE;
};

type RefreshTokenPayload = {
  sub: string;
  tokenType: typeof REFRESH_TOKEN_TYPE;
};

type JwtPayload = {
  sub?: string;
  phone?: string;
  role?: string;
  tokenType?: typeof ACCESS_TOKEN_TYPE | typeof REFRESH_TOKEN_TYPE;
};

/**
 * AuthService 负责认证领域的核心业务：
 * - 发送验证码
 * - 验证码登录 / 密码登录
 * - 注册
 * - JWT 签发
 *
 * 一般可以把它理解为“Controller 背后的真正处理者”。
 */
@Injectable()
export class AuthService {
  private redisClient: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 这里手动创建 Redis 客户端，用来存验证码和读取发送冷却时间
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
    const { phone, scene } = dto;
    await this.ensureSmsSceneAvailability(scene, phone);

    const codeKey = this.getSmsCodeKey(scene, phone);
    // 检查是否已经在冷却中
    const ttl = await this.redisClient.ttl(codeKey);
    if (ttl > SMS_CODE_COOLDOWN_THRESHOLD_SECONDS) {
      // 限制一分钟内只能发送一次（5分钟有效期，剩下 > 4分钟说明还没过一分钟）
      throw new BadRequestException('验证码发送过于频繁，请稍后再试');
    }

    // 随机生成 6 位验证码
    const code = this.generateSmsCode();

    // 将验证码存入 Redis，有效期 5 分钟
    await this.redisClient.setex(codeKey, SMS_CODE_TTL_SECONDS, code);

    // TODO: 真实对接短信平台发送代码
    console.log(
      `[SMS Simulation] Sending ${scene} code ${code} to phone ${phone}`,
    );
  }

  /**
   * 统一登录逻辑。
   *
   * 输入是 LoginDto，但真正的分支入口由 dto.type 决定：
   * - code: 验证码登录
   * - password: 密码登录
   *
   * 不管走哪条分支，最后都会收敛到 buildAuthResult，
   * 返回统一的 token + user + groups 结构。
   */
  async login(dto: LoginDto): Promise<any> {
    let user;
    const phone = dto.phone?.trim();
    const code = dto.code?.trim();
    const account = dto.account?.trim() || phone;
    const password = dto.password?.trim();

    if (dto.type === LoginType.CODE) {
      // 验证码登录要求 phone + code 同时存在
      if (!phone || !code) {
        throw new BadRequestException('手机号和验证码不能为空');
      }
      user = await this.verifyCodeAndGetUser(phone, code);
    } else if (dto.type === LoginType.PASSWORD) {
      // 密码登录兼容 account 字段名，本项目当前约定 account 实际上就是手机号
      if (!account || !password) {
        throw new BadRequestException('账号和密码不能为空');
      }
      user = await this.verifyPasswordAndGetUser(account, password);
    }

    if (!user) {
      throw new UnauthorizedException('登录失败，用户状态异常');
    }

    return this.buildAuthResult(user);
  }

  /**
   * 手机号密码注册。
   *
   * 流程：
   * 1. 基础字段清洗
   * 2. 检查手机号是否已注册
   * 3. 用 bcrypt 生成密码哈希，而不是明文入库
   * 4. 创建用户
   * 5. 直接复用 buildAuthResult 返回登录态
   */
  async register(dto: RegisterDto): Promise<any> {
    const phone = dto.phone.trim();
    const code = dto.code.trim();
    const password = dto.password.trim();
    const nickname = dto.nickname?.trim() || `CM_${phone.slice(-4)}`;

    await this.consumeSmsCode(SmsCodeScene.REGISTER, phone, code);

    const existing = await this.prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('该账号已注册，请直接登录');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarUrl = pickRandomDefaultAvatarPath();
    const user = await this.prisma.user.create({
      data: {
        phone,
        password_hash: passwordHash,
        nickname,
        avatar_url: avatarUrl,
      },
    });

    return this.buildAuthResult(user);
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在或已失效');
    }

    return this.issueTokenPair(user);
  }

  /**
   * 构造前端真正需要的认证返回值。
   *
   * 这里把“签 token”和“补充用户所在家庭组信息”收口到一个地方，
   * 这样登录、注册等入口都能复用同一套返回格式。
   */
  private async buildAuthResult(user: {
    id: string;
    phone: string;
    nickname: string;
    avatar_url: string | null;
    role: string;
    preferences: any;
    created_at: Date;
  }) {
    const { token, refreshToken } = await this.issueTokenPair(user);

    // 登录成功后顺手把用户所属家庭组一起返回，前端首页/切组场景可以直接使用
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

  private async issueTokenPair(user: {
    id: string;
    phone: string;
    role: string;
  }) {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      tokenType: ACCESS_TOKEN_TYPE,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenType: REFRESH_TOKEN_TYPE,
    };

    const token = await this.jwtService.signAsync(accessPayload);
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') as any,
    });

    return { token, refreshToken };
  }

  private async verifyRefreshToken(token: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch {
      throw new UnauthorizedException('刷新凭证已过期或无效');
    }

    if (!this.isRefreshTokenPayload(payload)) {
      throw new UnauthorizedException('刷新凭证类型不正确');
    }

    return { sub: payload.sub };
  }

  private isRefreshTokenPayload(payload: JwtPayload): payload is JwtPayload & {
    sub: string;
  } {
    if (payload.tokenType === REFRESH_TOKEN_TYPE) {
      return typeof payload.sub === 'string';
    }

    return (
      !payload.tokenType &&
      typeof payload.sub === 'string' &&
      typeof payload.phone === 'undefined' &&
      typeof payload.role === 'undefined'
    );
  }

  /**
   * 退出登录
   * 当前版本仅提供服务端占位接口，便于前后端流程对齐。
   */
  async logout(): Promise<null> {
    return null;
  }

  /**
   * 验证验证码并获取已存在用户
   *
   * 流程：
   * 1. 检查手机号对应用户是否存在
   * 2. 去 Redis 校验登录验证码
   * 3. 验证成功后删除验证码，避免重复使用
   */
  private async verifyCodeAndGetUser(phone: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('该账号未注册');
    }

    await this.consumeSmsCode(SmsCodeScene.LOGIN, phone, code);

    return user;
  }

  /**
   * 验证密码并获取用户
   *
   * 当前项目里 account 暂时就是手机号，所以直接按 phone 查询。
   * 查询到用户后，再用 bcrypt.compare 比较“明文密码”和“数据库里的哈希”。
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

  private getSmsCodeKey(scene: SmsCodeScene, phone: string) {
    return `auth:code:${scene}:${phone}`;
  }

  private generateSmsCode() {
    const nodeEnv =
      this.configService.get<string>('app.nodeEnv') ||
      process.env.NODE_ENV ||
      'development';

    if (nodeEnv !== 'production') {
      return '123456';
    }

    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async ensureSmsSceneAvailability(
    scene: SmsCodeScene,
    phone: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (scene === SmsCodeScene.REGISTER && existing) {
      throw new BadRequestException('该账号已注册，请直接登录');
    }

    if (scene === SmsCodeScene.LOGIN && !existing) {
      throw new BadRequestException('该账号未注册，请先注册');
    }
  }

  private async consumeSmsCode(
    scene: SmsCodeScene,
    phone: string,
    code: string,
  ) {
    const codeKey = this.getSmsCodeKey(scene, phone);
    const storedCode = await this.redisClient.get(codeKey);

    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('验证码不正确或已过期');
    }

    await this.redisClient.del(codeKey);
  }
}
