import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendSmsDto, LoginDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sms-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送短信验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  async sendSmsCode(@Body() sendSmsDto: SendSmsDto) {
    await this.authService.sendSmsCode(sendSmsDto);
    return { code: 0, data: null, msg: '验证码发送成功' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '统一登录入口 (验证码/密码)' })
  @ApiResponse({ status: 200, description: '登录成功，返回 Token' })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return { code: 0, data, msg: '登录成功' };
  }
}
