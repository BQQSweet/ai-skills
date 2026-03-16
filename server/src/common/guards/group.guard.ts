import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * 家庭组权限守卫。
 *
 * JwtAuthGuard 解决的是“你是不是已登录用户”；
 * GroupGuard 解决的是“你是不是这个 group 的成员”。
 *
 * 也就是说，它属于第二层权限校验，通常和 JwtAuthGuard 搭配使用。
 */
@Injectable()
export class GroupGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // groupId 在不同接口里可能来自路径、请求体或查询参数，所以这里统一兜底读取
    const groupId =
      request.params?.groupId ||
      request.body?.groupId ||
      request.query?.groupId;

    if (!user?.id) {
      throw new ForbiddenException('无权限访问');
    }

    if (!groupId) {
      throw new ForbiddenException('缺少家庭组 ID');
    }

    // 只要能查到成员关系，就说明当前用户属于这个家庭组
    const member = await this.prisma.groupMember.findFirst({
      where: {
        user_id: user.id,
        group_id: groupId,
      },
      include: {
        group: {
          select: {
            deleted_at: true,
          },
        },
      },
    });

    if (!member || member.group.deleted_at) {
      throw new ForbiddenException('非组内成员，无权操作');
    }

    // 顺手把当前用户在这个组内的角色挂到 request 上，后续代码可以继续复用
    request.groupRole = member.role;
    return true;
  }
}
