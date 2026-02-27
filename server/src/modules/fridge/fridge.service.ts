import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { AiService } from '../../ai/ai.service';
import { CreateFridgeItemDto } from './dto/create-fridge-item.dto';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class FridgeService {
  private readonly logger = new Logger(FridgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly config: ConfigService,
  ) {}

  /**
   * AI 识别食材标签图片，返回结构化的食材信息
   */
  async recognizeLabel(imageBase64: string) {
    const prompt = `你是一个食品标签识别专家。请仔细分析这张图片。
首先判断图片中是否包含食材、食品或其包装标签。
如果【不包含】食品或食材，请严格返回如下 JSON 并在 error 字段中写明原因：
{
  "is_food": false,
  "error": "未识别到食材，请对准食品标签或食材拍照"
}

如果包含，请提取以下信息并以 JSON 格式返回。如果某个字段无法从图片中识别出来，请根据常识以合理的值填充。

必须返回严格合法的 JSON 对象，不要有任何额外文本、注释或 markdown 标志。正确识别时的 JSON 结构如下：
{
  "is_food": true,
  "name": "食材名称（例：澳洲和牛）",
  "category": "分类，只能是以下之一：肉禽 / 果蔬 / 海鲜 / 乳制品 / 调味 / 主食 / 零食 / 饮品 / 其他",
  "quantity": 数量数字（例：500）,
  "unit": "单位（例：克、个、袋、盒、瓶）",
  "production_date": "生产日期 YYYY-MM-DD 格式，无法识别则为 null",
  "expire_date": "过期日期 YYYY-MM-DD 格式，如果只有保质期天数则根据生产日期推算"
}`;

    try {
      const result = await this.aiService.vision(imageBase64, prompt);
      this.logger.log(`AI recognition raw result: ${result}`);

      // 尝试从返回结果中提取 JSON
      let parsed: any;
      try {
        parsed = JSON.parse(result);
      } catch {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('无法从 AI 响应中提取 JSON');
        }
      }

      if (parsed.is_food === false) {
        throw new Error(parsed.error || '未识别到有效食材');
      }

      return parsed;
    } catch (error) {
      this.logger.error(
        `Label recognition error: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('食材识别失败：' + error.message);
    }
  }

  /**
   * 获取用户所属的第一个家庭组 ID
   */
  async getUserGroupId(userId: string): Promise<string> {
    const membership = await this.prisma.groupMember.findFirst({
      where: { user_id: userId },
      select: { group_id: true },
    });
    if (!membership) {
      throw new BadRequestException('您还没有加入任何家庭组');
    }
    return membership.group_id;
  }

  /**
   * 添加食材到冰箱
   */
  async addItem(groupId: string, dto: CreateFridgeItemDto) {
    // 如果有 base64 图片，保存到磁盘并生成 URL
    let photoUrl = dto.photo_url || null;
    if (dto.photo_base64) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'fridge');
      fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${randomUUID()}.jpg`;
      fs.writeFileSync(
        path.join(uploadDir, fileName),
        Buffer.from(dto.photo_base64, 'base64'),
      );
      const port = this.config.get('PORT') || 3000;
      photoUrl = `/uploads/fridge/${fileName}`;
      this.logger.log(`Saved fridge item photo: ${photoUrl}`);
    }

    // 查找同名且同过期日期的食材（同一家庭组、未删除）
    const existing = await this.prisma.fridgeItem.findFirst({
      where: {
        group_id: groupId,
        name: dto.name,
        expire_date: new Date(dto.expire_date),
        deleted_at: null,
      },
    });

    if (existing) {
      // 同名食材已存在，数量累加，并更新照片/过期日期等
      return this.prisma.fridgeItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + (dto.quantity || 1),
          ...(photoUrl && { photo_url: photoUrl }),
          ...(dto.expire_date && {
            expire_date: new Date(dto.expire_date),
            status: this.calcStatus(new Date(dto.expire_date)),
          }),
        },
      });
    }

    return this.prisma.fridgeItem.create({
      data: {
        group: { connect: { id: groupId } },
        name: dto.name,
        category: dto.category,
        quantity: dto.quantity,
        unit: dto.unit,
        expire_date: new Date(dto.expire_date),
        production_date: dto.production_date
          ? new Date(dto.production_date)
          : null,
        photo_url: photoUrl,
        source: dto.source || 'scan',
        status: this.calcStatus(new Date(dto.expire_date)),
      },
    });
  }

  /**
   * 查询冰箱食材列表
   */
  async listItems(groupId: string) {
    return this.prisma.fridgeItem.findMany({
      where: {
        group_id: groupId,
        deleted_at: null,
      },
      orderBy: { expire_date: 'asc' },
    });
  }

  /**
   * 一键清理过期食材（软删除）
   */
  async clearExpired(groupId: string) {
    const result = await this.prisma.fridgeItem.updateMany({
      where: {
        group_id: groupId,
        expire_date: { lt: new Date() },
        deleted_at: null,
      },
      data: { deleted_at: new Date() },
    });
    return { cleared: result.count };
  }

  /**
   * 删除冰箱食材（软删除）
   */
  async deleteItem(id: string) {
    return this.prisma.fridgeItem.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * 根据过期日期计算状态
   */
  private calcStatus(expireDate: Date): string {
    const now = new Date();
    const diffDays = Math.ceil(
      (expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'expiring';
    return 'fresh';
  }
}
