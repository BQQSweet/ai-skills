import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT 鉴权守卫
 *
 * Guard 会在进入 Controller 方法之前执行。
 * 这个 Guard 的职责是：
 * 1. 从请求头里读取 Bearer Token
 * 2. 校验 Token 是否合法、是否过期
 * 3. 把解码后的用户核心信息挂到 request.user
 *
 * 后续 Controller 才能通过 @CurrentUser() 拿到当前登录人。
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // 约定的请求头格式必须是：Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少登录凭证');
    }

    const token = authHeader.split(' ')[1];

    try {
      // verifyAsync 不仅会解码，还会校验签名和过期时间
      const payload = await this.jwtService.verifyAsync<{
        sub?: string;
        phone?: string;
        role?: string;
        tokenType?: 'access' | 'refresh';
      }>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      if (!this.isAccessTokenPayload(payload)) {
        throw new UnauthorizedException('登录凭证类型不正确');
      }
      // 这里只挂业务里常用的核心字段，避免后续代码反复自己解析 token
      request.user = {
        id: payload.sub,
        phone: payload.phone,
        role: payload.role,
      };
    } catch {
      throw new UnauthorizedException('登录凭证已过期或无效');
    }

    return true;
  }

  private isAccessTokenPayload(payload: {
    sub?: string;
    phone?: string;
    role?: string;
    tokenType?: 'access' | 'refresh';
  }): payload is {
    sub: string;
    phone: string;
    role: string;
    tokenType?: 'access';
  } {
    if (payload.tokenType === 'access') {
      return (
        typeof payload.sub === 'string' &&
        typeof payload.phone === 'string' &&
        typeof payload.role === 'string'
      );
    }

    return (
      !payload.tokenType &&
      typeof payload.sub === 'string' &&
      typeof payload.phone === 'string' &&
      typeof payload.role === 'string'
    );
  }
}
