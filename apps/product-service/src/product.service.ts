import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { RedisService } from './redis/redis.service';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private redis: RedisService,
  ) {}

  async create(product: CreateProductDto) {
    await this.redis.del('products:all');
    return this.repo.save(this.repo.create(product));
  }

  async findOne(id: string) {
    const cached = await this.redis.get<Product>(`product:${id}`);
    if (cached) return cached;

    const product = await this.repo.findOne({ where: { id } });
    if (product) await this.redis.set(`product:${id}`, product, 60);
    return product;
  }

  async findAll() {
    const cached = await this.redis.get<Product[]>('products:all');
    if (cached) return cached;

    const products = await this.repo.find();
    await this.redis.set('products:all', products, 60);
    return products;
  }

  async update(id: string, product: UpdateProductDto) {
    await this.redis.del(`product:${id}`);
    return this.repo.update(id, product);
  }

  async softDelete(id: string) {
    await this.redis.del(`product:${id}`);
    return this.repo.update(id, {isDeleted: true});
  }

  async delete(id: string) {
    await this.redis.del(`product:${id}`);
    return this.repo.delete(id);
  }
}
