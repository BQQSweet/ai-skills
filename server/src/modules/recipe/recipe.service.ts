import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  QueryRecipeDto,
} from './dto/recipe.dto';

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建食谱
   */
  async create(dto: CreateRecipeDto, userId?: string) {
    return this.prisma.recipe.create({
      data: {
        title: dto.title,
        description: dto.description,
        ingredients: dto.ingredients,
        steps: dto.steps,
        nutrition: dto.nutrition,
        difficulty: dto.difficulty,
        cook_time: dto.cook_time,
        servings: dto.servings ?? 2,
        cover_url: dto.cover_url,
        source_type: dto.source_type ?? 'manual',
        tags: dto.tags ?? [],
        status: dto.status ?? 'published',
        created_by: userId,
      },
    });
  }

  /**
   * 分页查询食谱列表
   */
  async findAll(query: QueryRecipeDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      deleted_at: null,
    };

    if (query.keyword) {
      where.title = { contains: query.keyword, mode: 'insensitive' };
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    const [list, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 获取单个食谱详情
   */
  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });
    if (!recipe || recipe.deleted_at) {
      throw new NotFoundException('食谱不存在');
    }
    return recipe;
  }

  /**
   * 更新食谱
   */
  async update(id: string, dto: UpdateRecipeDto) {
    await this.findOne(id); // 确认存在
    return this.prisma.recipe.update({
      where: { id },
      data: {
        ...dto,
        ingredients: dto.ingredients ?? undefined,
        steps: dto.steps ?? undefined,
        nutrition: dto.nutrition ?? undefined,
      },
    });
  }

  /**
   * 软删除食谱
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recipe.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
