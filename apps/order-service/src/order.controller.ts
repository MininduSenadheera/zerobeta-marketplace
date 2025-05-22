import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create.dto';
import { KafkaAuthGuard } from './kafka/kafka-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('')
export class OrderController {
  constructor(private readonly service: OrderService) { }

  @Get('/health')
  getHealth() {
    return { status: 'ok' };
  }
  
  @Post('create')
  async create(@Body() body: CreateOrderDto) {
    return this.service.createOrder(body);
  }

  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }


  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Get('seller')
  findBySeller(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req: { user: { id: string } }
  ) {
    return this.service.getOrdersBySeller(req.user.id, page, limit);
  }

  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Get('buyer')
  findByBuyer(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req: { user: { id: string } }
  ) {
    return this.service.getOrdersByBuyer(req.user.id, page, limit);
  }


  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Patch('cancel/:orderId')
  async cancel(
    @Param('orderId') orderId: string,
    @Req() req: { user: { id: string } }
  ) {
    return this.service.cancelOrder(orderId, req.user.id);
  }

  @Patch('update-pending')
  async updatePending() {
    return this.service.updatePendingOrdersToCompleted();
  }
}
