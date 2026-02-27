import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFridgeItemDto {
  @ApiProperty({ description: '食材名称', example: '澳洲和牛' })
  @IsString()
  name: string;

  @ApiProperty({ description: '分类', example: '肉禽' })
  @IsString()
  category: string;

  @ApiProperty({ description: '数量', example: 500 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: '单位', example: '克' })
  @IsString()
  unit: string;

  @ApiProperty({ description: '过期日期', example: '2026-03-15' })
  @IsDateString()
  expire_date: string;

  @ApiPropertyOptional({ description: '生产日期', example: '2026-02-20' })
  @IsOptional()
  @IsDateString()
  production_date?: string;

  @ApiPropertyOptional({ description: '照片 URL' })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiPropertyOptional({ description: '照片 Base64 编码（扫描时传入）' })
  @IsOptional()
  @IsString()
  photo_base64?: string;

  @ApiPropertyOptional({
    description: '来源：scan / voice / manual',
    default: 'scan',
  })
  @IsOptional()
  @IsString()
  source?: string;
}
