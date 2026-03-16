import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建家庭组 DTO。
 *
 * DTO 只描述“接口接收什么格式的数据”，
 * 至于邀请码如何生成、创建者是否自动成为 owner，这些都属于 Service 的业务逻辑。
 */
export class CreateGroupDto {
  @ApiProperty({ description: '家庭组名称', example: '幸福里小家' })
  @IsString()
  @IsNotEmpty({ message: '家庭组名称不能为空' })
  @Length(1, 50, { message: '家庭组名称长度为 1~50 个字符' })
  name: string;
}

/**
 * 加入家庭组 DTO。
 *
 * 这里只校验邀请码是否是 6 位字符串，
 * “这个邀请码是否真实存在、是否已失效”需要到 Service 里查数据库才能判断。
 */
export class JoinGroupDto {
  @ApiProperty({ description: '6 位邀请码', example: 'A1B2C3' })
  @IsString()
  @IsNotEmpty({ message: '邀请码不能为空' })
  @Length(6, 6, { message: '邀请码必须为 6 位' })
  inviteCode: string;
}
