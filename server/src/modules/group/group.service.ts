import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { CreateGroupDto, JoinGroupDto } from './dto/group.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 生成 6 位随机邀请码（大写字母 + 数字）
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的 I/O/0/1
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * 创建家庭组
   * - 自动生成唯一邀请码
   * - 创建者自动成为 owner
   */
  async createGroup(userId: string, dto: CreateGroupDto) {
    // 生成唯一邀请码（重试机制）
    let inviteCode: string;
    let attempts = 0;
    do {
      inviteCode = this.generateInviteCode();
      const existing = await this.prisma.group.findUnique({
        where: { invite_code: inviteCode },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new BadRequestException('生成邀请码失败，请重试');
    }

    // 事务：同时创建组 + 成员记录
    const group = await this.prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name: dto.name,
          invite_code: inviteCode,
          owner_id: userId,
        },
      });

      await tx.groupMember.create({
        data: {
          user_id: userId,
          group_id: newGroup.id,
          role: 'owner',
        },
      });

      return newGroup;
    });

    return {
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      ownerId: group.owner_id,
      createdAt: group.created_at,
    };
  }

  /**
   * 通过邀请码加入家庭组
   */
  async joinByInviteCode(userId: string, dto: JoinGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { invite_code: dto.inviteCode },
    });

    if (!group) {
      throw new NotFoundException('邀请码无效或已失效');
    }

    // 检查是否已经是成员
    const existingMember = await this.prisma.groupMember.findUnique({
      where: {
        user_id_group_id: { user_id: userId, group_id: group.id },
      },
    });

    if (existingMember) {
      throw new ConflictException('你已经是该家庭组的成员');
    }

    // 加入家庭组
    await this.prisma.groupMember.create({
      data: {
        user_id: userId,
        group_id: group.id,
        role: 'member',
      },
    });

    return {
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      role: 'member',
    };
  }

  /**
   * 获取用户所属的所有家庭组
   */
  async getMyGroups(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { user_id: userId },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    avatar_url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      inviteCode: m.group.invite_code,
      role: m.role,
      memberCount: m.group.members.length,
      members: m.group.members.map((mem) => ({
        id: mem.user.id,
        nickname: mem.user.nickname,
        avatarUrl: mem.user.avatar_url,
        role: mem.role,
      })),
      createdAt: m.group.created_at,
    }));
  }

  /**
   * 获取单个家庭组详情
   */
  async getGroupDetail(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar_url: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('家庭组不存在');
    }

    return {
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      ownerId: group.owner_id,
      memberCount: group.members.length,
      members: group.members.map((m) => ({
        id: m.user.id,
        nickname: m.user.nickname,
        avatarUrl: m.user.avatar_url,
        phone: m.user.phone,
        role: m.role,
      })),
      createdAt: group.created_at,
    };
  }

  /**
   * 刷新邀请码（仅 owner 可操作）
   */
  async refreshInviteCode(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('家庭组不存在');
    }

    if (group.owner_id !== userId) {
      throw new BadRequestException('只有组长可以刷新邀请码');
    }

    let newCode: string;
    let attempts = 0;
    do {
      newCode = this.generateInviteCode();
      const existing = await this.prisma.group.findUnique({
        where: { invite_code: newCode },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const updated = await this.prisma.group.update({
      where: { id: groupId },
      data: { invite_code: newCode },
    });

    return { inviteCode: updated.invite_code };
  }
}
