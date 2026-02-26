import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: '家庭组名称', example: '幸福里小家' })
  @IsString()
  @IsNotEmpty({ message: '家庭组名称不能为空' })
  @Length(1, 50, { message: '家庭组名称长度为 1~50 个字符' })
  name: string;
}

export class JoinGroupDto {
  @ApiProperty({ description: '6 位邀请码', example: 'A1B2C3' })
  @IsString()
  @IsNotEmpty({ message: '邀请码不能为空' })
  @Length(6, 6, { message: '邀请码必须为 6 位' })
  inviteCode: string;
}
