import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GroupGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
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

    // 将角色信息挂载到请求对象
    request.groupRole = member.role;
    return true;
  }
}
