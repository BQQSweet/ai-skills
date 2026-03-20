import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export enum SmsCodeScene {
  LOGIN = 'login',
  REGISTER = 'register',
}

/**
 * DTO（Data Transfer Object）用于描述接口入参。
 *
 * 在 Nest 里它通常同时承担两件事：
 * 1. 配合 class-validator 做参数校验
 * 2. 配合 Swagger 装饰器生成接口文档
 *
 * 所以 DTO 既是“参数规则”，也是“接口契约”的一部分。
 */
export class SendSmsDto {
  @ApiProperty({ description: '手机号' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({ description: '验证码发送场景', enum: SmsCodeScene })
  @IsEnum(SmsCodeScene, { message: '不合法的验证码场景' })
  scene: SmsCodeScene;
}

export enum LoginType {
  CODE = 'code',
  PASSWORD = 'password',
}

/**
 * 登录接口 DTO。
 *
 * 注意这里不是“所有字段都必填”：
 * - type=code 时，phone + code 必填
 * - type=password 时，account/phone + password 必填
 *
 * 这种“分支必填”规则由 Service 再做二次判断。
 */
export class LoginDto {
  @ApiProperty({ description: '登录类型', enum: LoginType })
  @IsEnum(LoginType, { message: '不合法的登录类型' })
  type: LoginType;

  @ApiPropertyOptional({ description: '手机号（验证码或密码登录用）' })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '验证码' })
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: '验证码必须为6位数字' })
  code?: string;

  @ApiPropertyOptional({
    description: '账号（其实也是手机号，兼容前端字段名）',
  })
  @IsOptional()
  @IsString()
  account?: string;

  @ApiPropertyOptional({ description: '密码' })
  @IsOptional()
  @IsString()
  password?: string;
}

/**
 * 注册 DTO。
 *
 * 这里约束的是“接口能接收什么格式的数据”，
 * 但像“手机号是否已被注册”这种业务校验，则应该在 Service 中处理。
 */
export class RegisterDto {
  @ApiProperty({ description: '手机号' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({ description: '短信验证码' })
  @IsString()
  @Matches(/^\d{6}$/, { message: '验证码必须为6位数字' })
  code: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @Length(6, 32, { message: '密码长度需为 6 到 32 位' })
  password: string;

  @ApiPropertyOptional({ description: '昵称，不传则自动生成' })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: '昵称长度需为 1 到 50 位' })
  nickname?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新 Token' })
  @IsString()
  @IsNotEmpty({ message: 'refreshToken 不能为空' })
  refreshToken: string;
}
