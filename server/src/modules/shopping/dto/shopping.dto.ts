import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShoppingListDto {
  @ApiProperty({ description: '购物清单标题', example: '周末聚餐食材' })
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  @Length(1, 100, { message: '标题长度为 1~100 个字符' })
  title: string;

  @ApiPropertyOptional({ description: '关联的菜谱ID' })
  @IsOptional()
  @IsUUID('4', { message: '菜谱ID格式不正确' })
  recipeId?: string;

  @ApiPropertyOptional({
    description: '来源',
    enum: ['manual', 'recipe'],
    default: 'manual',
  })
  @IsOptional()
  @IsEnum(['manual', 'recipe'], { message: '来源必须是 manual 或 recipe' })
  source?: string;
}

export class AddShoppingItemDto {
  @ApiProperty({ description: '食材名称', example: '西红柿' })
  @IsString()
  @IsNotEmpty({ message: '食材名称不能为空' })
  @Length(1, 100, { message: '食材名称长度为 1~100 个字符' })
  name: string;

  @ApiProperty({ description: '分类', example: '蔬菜' })
  @IsString()
  @IsNotEmpty({ message: '分类不能为空' })
  category: string;

  @ApiProperty({ description: '数量', example: 2 })
  @IsNumber({}, { message: '数量必须是数字' })
  @Min(0.01, { message: '数量必须大于 0' })
  quantity: number;

  @ApiProperty({ description: '单位', example: '个' })
  @IsString()
  @IsNotEmpty({ message: '单位不能为空' })
  unit: string;

  @ApiPropertyOptional({ description: '备注', example: '要新鲜的' })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: '备注长度不能超过 200 个字符' })
  note?: string;
}

export class UpdateShoppingItemDto {
  @ApiPropertyOptional({ description: '食材名称' })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: '食材名称长度为 1~100 个字符' })
  name?: string;

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '数量' })
  @IsOptional()
  @IsNumber({}, { message: '数量必须是数字' })
  @Min(0.01, { message: '数量必须大于 0' })
  quantity?: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: '备注长度不能超过 200 个字符' })
  note?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['pending', 'claimed', 'purchased'] })
  @IsOptional()
  @IsEnum(['pending', 'claimed', 'purchased'], {
    message: '状态必须是 pending、claimed 或 purchased',
  })
  status?: string;
}

export class ClaimShoppingItemDto {
  @ApiProperty({ description: '领取者用户ID' })
  @IsUUID('4', { message: '用户ID格式不正确' })
  assignedTo: string;
}
