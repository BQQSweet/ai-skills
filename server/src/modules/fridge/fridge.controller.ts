import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FridgeService } from './fridge.service';
import { CreateFridgeItemDto } from './dto/create-fridge-item.dto';
import { RecognizeLabelDto } from './dto/recognize-label.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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
  @ApiOperation({ summary: '添加食材到冰箱' })
  async addItem(@Body() dto: CreateFridgeItemDto, @Req() req: any) {
    const groupId = await this.fridgeService.getUserGroupId(req.user.id);
    return this.fridgeService.addItem(groupId, dto);
  }

  @Get('items')
  @ApiOperation({ summary: '查询冰箱食材列表' })
  async listItems(@Req() req: any) {
    const groupId = await this.fridgeService.getUserGroupId(req.user.id);
    return this.fridgeService.listItems(groupId);
  }

  @Delete('items/expired')
  @ApiOperation({ summary: '一键清理过期食材' })
  async clearExpired(@Req() req: any) {
    const groupId = await this.fridgeService.getUserGroupId(req.user.id);
    return this.fridgeService.clearExpired(groupId);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '删除冰箱食材（软删除）' })
  async deleteItem(@Param('id') id: string) {
    return this.fridgeService.deleteItem(id);
  }
}
