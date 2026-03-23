import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class VideoRecipeModeDto {
  @ApiPropertyOptional({
    description: '视频解析模式',
    enum: ['strict', 'assisted'],
    default: 'strict',
  })
  @IsOptional()
  @IsIn(['strict', 'assisted'], { message: 'mode 仅支持 strict 或 assisted' })
  mode?: 'strict' | 'assisted';
}

export class RegenerateVideoRecipeDto {
  @ApiProperty({
    description: '重生成模式',
    enum: ['strict', 'assisted'],
  })
  @IsIn(['strict', 'assisted'], { message: 'mode 仅支持 strict 或 assisted' })
  mode!: 'strict' | 'assisted';
}
