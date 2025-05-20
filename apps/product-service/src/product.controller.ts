import { Controller, Post, Body, Get, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { updateStockDto } from './dto/update-stock.dto';

@Controller('products')
export class ProductController {
  constructor(private service: ProductService) { }

  @EventPattern('product.stock.orderCount.update')
  updateStockOrderCountUpdate(@Payload() body: updateStockDto) {
    return this.service.updateStockOrderCountUpdate(body);
  }

  @EventPattern('product.ids.by.seller')
  findProductIdsBySeller(@Payload() body: { sellerId: string }) {
    return this.service.findProductIdsBySeller(body.sellerId);
  }

  @EventPattern('product.get.details.bulk')
  findBulkProductDetails(@Payload() body: { productIds: string[] }) {
    return this.service.findBulkProductDetails(body.productIds);
  }

  // TODO: should be seller validated
  @Post('create')
  create(@Body() body: CreateProductDto) {
    return this.service.create(body);
  }

  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('all')
  findAll() {
    return this.service.findAll();
  }

  @Post('by-ids')
  findBulkProductDetailsHttp(@Body() body: { productIds: string[] }) {
    return this.service.findBulkProductDetails(body.productIds);
  }

  // TODO: should be seller validated
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.service.update(id, body);
  }

  // TODO: should be seller validated
  @Patch('hide/:id')
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  // TODO: should be seller validated
  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
