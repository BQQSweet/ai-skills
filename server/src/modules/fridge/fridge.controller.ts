import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FridgeService } from './fridge.service';
import { CreateFridgeItemDto } from './dto/create-fridge-item.dto';
import { RecognizeLabelDto } from './dto/recognize-label.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GroupGuard } from '@/common/guards/group.guard';

@ApiTags('fridge')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/fridge')
export class FridgeController {
  constructor(private readonly fridgeService: FridgeService) {}

  @Post('recognize')
  @ApiOperation({ summary: 'AI 识别食材标签图片' })
  async recognizeLabel(@Body() dto: RecognizeLabelDto) {
    return this.fridgeService.recognizeLabel(dto.image);
  }

  @Post('items')
  @UseGuards(GroupGuard)
  @ApiOperation({ summary: '添加食材到冰箱' })
  async addItem(@Body() dto: CreateFridgeItemDto) {
    return this.fridgeService.addItem(dto.groupId, dto);
  }

  @Get('items')
  @UseGuards(GroupGuard)
  @ApiOperation({ summary: '查询冰箱食材列表' })
  async listItems(@Query('groupId') groupId: string) {
    return this.fridgeService.listItems(groupId);
  }

  @Delete('items/expired')
  @UseGuards(GroupGuard)
  @ApiOperation({ summary: '一键清理过期食材' })
  async clearExpired(@Query('groupId') groupId: string) {
    return this.fridgeService.clearExpired(groupId);
  }

  @Delete('items/:id')
  @UseGuards(GroupGuard)
  @ApiOperation({ summary: '删除冰箱食材（软删除）' })
  async deleteItem(@Param('id') id: string, @Query('groupId') groupId: string) {
    return this.fridgeService.deleteItem(id, groupId);
  }
}
