import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecognizeLabelDto {
  @ApiProperty({ description: '食材标签图片的 Base64 编码字符串' })
  @IsString()
  image: string;
}
