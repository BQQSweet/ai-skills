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
import { ShoppingService } from './shopping.service';
import {
  CreateShoppingListDto,
  AddShoppingItemDto,
  UpdateShoppingItemDto,
} from './dto/shopping.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('shopping')
@Controller('api/shopping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Post(':groupId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建购物清单' })
  async createShoppingList(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateShoppingListDto,
  ) {
    return this.shoppingService.createShoppingList(groupId, userId, dto);
  }

  @Get(':groupId')
  @ApiOperation({ summary: '获取家庭组购物清单列表' })
  async getShoppingLists(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shoppingService.getShoppingLists(groupId, userId);
  }

  @Get('list/:listId')
  @ApiOperation({ summary: '获取购物清单详情' })
  async getShoppingListDetail(
    @Param('listId') listId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shoppingService.getShoppingListDetail(listId, userId);
  }

  @Post('list/:listId/item')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加购物清单项' })
  async addShoppingItem(
    @Param('listId') listId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddShoppingItemDto,
  ) {
    return this.shoppingService.addShoppingItem(listId, userId, dto);
  }

  @Put('item/:itemId')
  @ApiOperation({ summary: '更新购物清单项' })
  async updateShoppingItem(
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateShoppingItemDto,
  ) {
    return this.shoppingService.updateShoppingItem(itemId, userId, dto);
  }

  @Delete('item/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除购物清单项' })
  async deleteShoppingItem(
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shoppingService.deleteShoppingItem(itemId, userId);
  }

  @Put('item/:itemId/claim')
  @ApiOperation({ summary: '领取购物任务' })
  async claimShoppingItem(
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shoppingService.claimShoppingItem(itemId, userId);
  }

  @Put('item/:itemId/purchase')
  @ApiOperation({ summary: '标记为已购买' })
  async markAsPurchased(
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shoppingService.markAsPurchased(itemId, userId);
  }

  @Put('list/:listId/complete')
  @ApiOperation({ summary: '完成购物清单' })
  async completeShoppingList(
    @Param('listId') listId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shoppingService.completeShoppingList(listId, userId);
  }

  @Delete(':groupId/purchased')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '清空已购买项' })
  async clearPurchased(
    @Param('groupId') groupId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shoppingService.clearPurchased(groupId, userId);
  }
}
