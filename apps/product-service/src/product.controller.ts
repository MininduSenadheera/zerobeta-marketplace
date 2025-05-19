import { Controller, Post, Body, Get, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';

@Controller('products')
export class ProductController {
  constructor(private service: ProductService) { }

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.service.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.service.update(id, body);
  }

  @Patch(':id/delete')
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
