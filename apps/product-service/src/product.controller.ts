import { Controller, Post, Body, Get, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { updateStockDto } from './dto/update-stock.dto';
import { KafkaAuthGuard } from './kafka/kafka-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('')
export class ProductController {
  constructor(private service: ProductService) { }

  @EventPattern('product.stock.orderCount.update')
  updateStockOrderCountUpdate(@Payload() body: updateStockDto) {
    return this.service.updateStockOrderCountUpdate(body);
  }

  @MessagePattern('product.ids.by.seller')
  async findProductIdsBySeller(@Payload() sellerId: string) {
    return await this.service.findProductIdsBySeller(sellerId);
  }

  @MessagePattern('product.get.details.bulk')
  async findBulkProductDetails(@Payload() productIds: string[]) {
    return await this.service.findBulkProductDetails(productIds);
  }

  @Get('/health')
  getHealth() {
    return { status: 'ok' };
  }
  
  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Post('create')
  create(@Body() body: CreateProductDto, @Req() req: { user: { id: string } }) {
    return this.service.create({ ...body, sellerId: req.user.id });
  }

  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Get('by-seller')
  findProductsBySeller(@Req() req: { user: { id: string } }) {
    return this.service.findProductsBySeller(req.user.id);
  }

  @Post('by-ids')
  findBulkProductDetailsHttp(@Body() body: { productIds: string[] }) {
    return this.service.findBulkProductDetails(body.productIds);
  }

  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto, @Req() req: { user: { id: string } }) {
    return this.service.update(id, body, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Patch('hide/:id')
  softDelete(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.service.softDelete(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(KafkaAuthGuard)
  @Delete('delete/:id')
  delete(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.service.delete(id, req.user.id);
  }
}
