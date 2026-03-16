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

  private async getActiveGroupById(groupId: string) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        deleted_at: null,
      },
    });

    if (!group) {
      throw new NotFoundException('家庭组不存在');
    }

    return group;
  }

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
      role: 'owner',
      memberCount: 1,
      createdAt: group.created_at,
    };
  }

  /**
   * 通过邀请码加入家庭组
   */
  async joinByInviteCode(userId: string, dto: JoinGroupDto) {
    const group = await this.prisma.group.findFirst({
      where: {
        invite_code: dto.inviteCode,
        deleted_at: null,
      },
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

    return memberships
      .filter((m) => m.group.deleted_at === null)
      .map((m) => ({
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
  async getGroupDetail(groupId: string, userId: string) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        deleted_at: null,
      },
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

    const currentMember = group.members.find((member) => member.user_id === userId);

    return {
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      ownerId: group.owner_id,
      role: currentMember?.role || 'member',
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
   * 获取家庭组成员列表
   */
  async getGroupMembers(groupId: string, userId: string) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,
        deleted_at: null,
      },
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
    });

    if (!group) {
      throw new NotFoundException('家庭组不存在');
    }

    const currentMember = group.members.find((member) => member.user_id === userId);

    return {
      id: group.id,
      name: group.name,
      inviteCode: group.invite_code,
      ownerId: group.owner_id,
      role: currentMember?.role || 'member',
      memberCount: group.members.length,
      members: group.members.map((m) => ({
        id: m.user.id,
        nickname: m.user.nickname,
        avatarUrl: m.user.avatar_url,
        role: m.role,
      })),
      createdAt: group.created_at,
    };
  }

  /**
   * 刷新邀请码（仅 owner 可操作）
   */
  async refreshInviteCode(groupId: string, userId: string) {
    const group = await this.getActiveGroupById(groupId);

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

  /**
   * 退出家庭组
   */
  async leaveGroup(groupId: string, userId: string) {
    await this.getActiveGroupById(groupId);

    const membership = await this.prisma.groupMember.findUnique({
      where: {
        user_id_group_id: { user_id: userId, group_id: groupId },
      },
    });

    if (!membership) {
      throw new NotFoundException('家庭组成员关系不存在');
    }

    if (membership.role === 'owner') {
      throw new BadRequestException('组长不能退出家庭组，请解散家庭组');
    }

    await this.prisma.groupMember.delete({
      where: {
        user_id_group_id: { user_id: userId, group_id: groupId },
      },
    });

    return { success: true };
  }

  /**
   * 解散家庭组（仅剩组长时）
   */
  async disbandGroup(groupId: string, userId: string) {
    const group = await this.getActiveGroupById(groupId);

    if (group.owner_id !== userId) {
      throw new BadRequestException('只有组长可以解散家庭组');
    }

    const memberCount = await this.prisma.groupMember.count({
      where: { group_id: groupId },
    });

    if (memberCount > 1) {
      throw new BadRequestException('请先让其他成员退出后再解散家庭组');
    }

    await this.prisma.$transaction([
      this.prisma.group.update({
        where: { id: groupId },
        data: { deleted_at: new Date() },
      }),
      this.prisma.groupMember.deleteMany({
        where: { group_id: groupId },
      }),
    ]);

    return { success: true };
  }
}
