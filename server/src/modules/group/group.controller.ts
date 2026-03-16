import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto, JoinGroupDto } from './dto/group.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { GroupGuard } from '@/common/guards/group.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('group')
@Controller('api/group')
@ApiBearerAuth()
/**
 * GroupController 是家庭组相关接口的 HTTP 入口层。
 *
 * 这里最值得注意的是 Guard 的组合使用：
 * - JwtAuthGuard：确认“你是谁”，也就是是否已登录
 * - GroupGuard：确认“你能不能操作这个组”，也就是是否属于目标家庭组
 */
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建家庭组' })
  async createGroup(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGroupDto,
  ) {
    // 这里通过 @CurrentUser('id') 直接拿到 JwtAuthGuard 挂载好的 request.user.id
    return this.groupService.createGroup(userId, dto);
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '通过邀请码加入家庭组' })
  async joinGroup(
    @CurrentUser('id') userId: string,
    @Body() dto: JoinGroupDto,
  ) {
    return this.groupService.joinByInviteCode(userId, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取我的家庭组列表' })
  async getMyGroups(@CurrentUser('id') userId: string) {
    return this.groupService.getMyGroups(userId);
  }

  @Get(':groupId')
  @UseGuards(JwtAuthGuard, GroupGuard)
  @ApiOperation({ summary: '获取家庭组详情' })
  async getGroupDetail(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    // 只有同时通过“已登录”与“属于该家庭组”两层校验，才会进入这个方法
    return this.groupService.getGroupDetail(groupId, userId);
  }

  @Get(':groupId/members')
  @UseGuards(JwtAuthGuard, GroupGuard)
  @ApiOperation({ summary: '获取家庭组成员列表' })
  async getGroupMembers(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupService.getGroupMembers(groupId, userId);
  }

  @Put(':groupId/invite-code')
  @UseGuards(JwtAuthGuard, GroupGuard)
  @ApiOperation({ summary: '刷新邀请码（仅组长）' })
  async refreshInviteCode(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupService.refreshInviteCode(groupId, userId);
  }

  @Delete(':groupId/members/me')
  @UseGuards(JwtAuthGuard, GroupGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '退出家庭组（普通成员）' })
  async leaveGroup(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupService.leaveGroup(groupId, userId);
  }

  @Delete(':groupId')
  @UseGuards(JwtAuthGuard, GroupGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '解散家庭组（仅组长且仅剩本人）' })
  async disbandGroup(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupService.disbandGroup(groupId, userId);
  }
}
