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
 * 从请求头 Authorization: Bearer <token> 中解析并校验 JWT，
 * 将解码后的 payload 挂载到 request.user 上。
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

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少登录凭证');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      // 将用户信息挂载到 request 上，供 @CurrentUser() 装饰器使用
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
}
