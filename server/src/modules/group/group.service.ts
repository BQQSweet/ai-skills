import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { CreateGroupDto, JoinGroupDto } from './dto/group.dto';

/**
 * GroupService 负责家庭组领域的业务规则和数据库操作。
 *
 * 可以把它和 Controller 的分工理解为：
 * - Controller：负责接 HTTP 请求、取参数、挂权限装饰器
 * - Service：负责真正的业务流程、校验和 Prisma 查询
 */
@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询一个“未被软删除”的家庭组。
   *
   * 这里反复出现的 deleted_at: null 是软删除语义：
   * 数据并没有真的从数据库消失，而是通过 deleted_at 是否为空来区分是否有效。
   */
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
   *
   * 这里使用事务，是因为“创建 group”和“创建 group_member”必须同时成功或同时失败，
   * 否则会出现组已创建但成员关系缺失的脏数据。
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
   *
   * 核心业务规则：
   * - 邀请码必须对应一个未删除的家庭组
   * - 同一个用户不能重复加入同一个组
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
   *
   * 这里使用 include 把 group、members、user 一次查出来，
   * 目的是减少多次往返数据库，直接组装前端可用结构。
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
   *
   * 因为 GroupGuard 已经提前保证“当前用户属于这个组”，
   * 这里的重点就变成查询详情并整理返回结构。
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

    const currentMember = group.members.find(
      (member) => member.user_id === userId,
    );

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

    const currentMember = group.members.find(
      (member) => member.user_id === userId,
    );

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
   *
   * 这里没有重新查成员关系，而是直接用 group.owner_id 判断，
   * 因为“谁是组长”这个事实本来就记录在 group 表里。
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
   *
   * 注意：这里只处理“当前用户退出自己所在的组”，
   * 并不负责踢出其他成员，那会是另一条业务规则。
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
