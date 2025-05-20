import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) { }

  // TODO: should be buyer validated
  @Post('create')
  async create(@Body() body: CreateOrderDto) {
    return this.service.createOrder(body);
  }

  // TODO: should be buyer or seller validated
  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // TODO: should be seller validated
  @Get('seller')
  findBySeller(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('sellerId') sellerId: string
  ) {
    return this.service.getOrdersBySeller(sellerId, page, limit);
  }

  // TODO: should be buyer validated
  @Get('buyer')
  async findByBuyer(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Param('buyerId') buyerId: string
  ) {
    return this.service.getOrdersByBuyer(buyerId, page, limit);
  }

  // TODO: should be buyer validated
  @Patch('cancel')
  async cancel(
    body: { id: string, buyerId: string }
  ) {
    return this.service.cancelOrder(body.id, body.buyerId);
  }

  @Patch('update-pending')
  async updatePending() {
    return this.service.updatePendingOrdersToCompleted();
  }
}
