import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendSmsDto, LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('api/auth')
/**
 * AuthController 只负责“HTTP 入口层”：
 * - 通过装饰器声明路由
 * - 接收并校验 DTO
 * - 调用 AuthService 执行业务
 *
 * 它一般不直接写复杂业务规则，这样 Controller 会保持清晰，Service 更便于复用。
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sms-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送短信验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  async sendSmsCode(@Body() sendSmsDto: SendSmsDto) {
    // @Body() 会结合全局 ValidationPipe，先把请求体校验成合法 DTO 再进入方法
    await this.authService.sendSmsCode(sendSmsDto);
    // 返回 null 也没问题，最终仍会被全局响应拦截器包成统一格式
    return null;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '统一登录入口 (验证码/密码)' })
  @ApiResponse({ status: 200, description: '登录成功，返回 Token' })
  async login(@Body() loginDto: LoginDto) {
    // 登录到底走验证码还是密码分支，由 Service 根据 dto.type 决定
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手机号密码注册并返回登录态' })
  @ApiResponse({ status: 200, description: '注册成功，返回 Token' })
  async register(@Body() registerDto: RegisterDto) {
    // 注册成功后直接返回登录态，前端不需要再额外调一次登录接口
    return this.authService.register(registerDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '退出登录（预留服务端注销入口）' })
  @ApiResponse({ status: 200, description: '退出成功' })
  async logout() {
    return this.authService.logout();
  }
}
