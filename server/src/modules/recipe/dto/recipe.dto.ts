import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateRecipeDto {
  @ApiProperty({ description: '食谱标题', example: '西红柿炒鸡蛋' })
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '食材列表 JSON',
    example: [{ name: '鸡蛋', quantity: 3, unit: '个', optional: false }],
  })
  @IsArray()
  ingredients: any[];

  @ApiProperty({
    description: '步骤列表 JSON',
    example: [
      {
        order: 1,
        instruction: '打散鸡蛋',
        duration_min: 2,
        timer_required: false,
      },
    ],
  })
  @IsArray()
  steps: any[];

  @ApiPropertyOptional({ description: '营养信息 JSON' })
  @IsOptional()
  nutrition?: any;

  @ApiProperty({ description: '难度', example: '简单' })
  @IsString()
  @IsIn(['简单', '中等', '困难'], { message: '难度值无效' })
  difficulty: string;

  @ApiProperty({ description: '烹饪时间（分钟）', example: 15 })
  @IsInt()
  @Min(1)
  @Max(600)
  cook_time: number;

  @ApiPropertyOptional({ description: '份量', example: 2 })
  @IsInt()
  @IsOptional()
  @Min(1)
  servings?: number;

  @ApiPropertyOptional({ description: '封面图 URL' })
  @IsString()
  @IsOptional()
  cover_url?: string;

  @ApiPropertyOptional({ description: '来源类型', example: 'manual' })
  @IsString()
  @IsOptional()
  source_type?: string;

  @ApiPropertyOptional({ description: '标签', example: ['家常菜', '快手菜'] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: '状态',
    example: 'published',
    enum: ['published', 'draft', 'archived'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['published', 'draft', 'archived'])
  status?: string;
}

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}

export class QueryRecipeDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 10 })
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ description: '标题搜索' })
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态筛选' })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: '难度筛选' })
  @IsOptional()
  difficulty?: string;
}

export class RecommendRecipeQueryDto {
  @ApiPropertyOptional({
    description: '是否强制刷新推荐，传 1 表示换一批',
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsIn([1], { message: 'refresh 仅支持传 1' })
  refresh?: number;
}
