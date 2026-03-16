import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('feed')
@Controller('api/feed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get(':groupId')
  @ApiOperation({ summary: '获取家庭组动态列表' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getFeedList(
    @Param('groupId') groupId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.feedService.getFeedList(
      groupId,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Delete(':groupId')
  @ApiOperation({ summary: '清空家庭组动态' })
  async clearFeed(@Param('groupId') groupId: string) {
    return this.feedService.clearFeed(groupId);
  }
}
