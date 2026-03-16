import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  Length,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

export class RecipeShoppingIngredientDto {
  @ApiProperty({ description: '食材名称', example: '西红柿' })
  @IsString()
  @IsNotEmpty({ message: '食材名称不能为空' })
  name: string;

  @ApiProperty({ description: '数量', example: 2 })
  @IsNumber({}, { message: '数量必须是数字' })
  @Min(0.01, { message: '数量必须大于 0' })
  quantity: number;

  @ApiProperty({ description: '单位', example: '个' })
  @IsString()
  @IsNotEmpty({ message: '单位不能为空' })
  unit: string;

  @ApiPropertyOptional({ description: '是否可选食材', default: false })
  @IsOptional()
  optional?: boolean;
}

export class GenerateShoppingListFromRecipeDto {
  @ApiPropertyOptional({ description: '关联食谱 ID' })
  @IsOptional()
  @IsUUID('4', { message: '食谱ID格式不正确' })
  recipeId?: string;

  @ApiProperty({ description: '食谱标题', example: '西红柿炒鸡蛋' })
  @IsString()
  @IsNotEmpty({ message: '食谱标题不能为空' })
  @Length(1, 100, { message: '食谱标题长度为 1~100 个字符' })
  recipeTitle: string;

  @ApiProperty({
    description: '食谱所需食材',
    type: [RecipeShoppingIngredientDto],
  })
  @ValidateNested({ each: true })
  @Type(() => RecipeShoppingIngredientDto)
  @ArrayMinSize(1, { message: '至少需要一个食材' })
  ingredients: RecipeShoppingIngredientDto[];

  @ApiProperty({
    description: '生成模式',
    enum: ['create', 'overwrite'],
  })
  @IsEnum(['create', 'overwrite'], {
    message: '模式必须是 create 或 overwrite',
  })
  mode: 'create' | 'overwrite';

  @ApiPropertyOptional({ description: '覆盖目标清单 ID' })
  @IsOptional()
  @IsUUID('4', { message: '目标清单ID格式不正确' })
  targetListId?: string;
}

export class AssignShoppingItemDto {
  @ApiProperty({ description: '要分配给的成员用户ID' })
  @IsUUID('4', { message: '用户ID格式不正确' })
  assignedTo: string;
}
