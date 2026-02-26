import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class SendSmsDto {
  @ApiProperty({ description: '手机号' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}

export enum LoginType {
  CODE = 'code',
  PASSWORD = 'password',
}

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
