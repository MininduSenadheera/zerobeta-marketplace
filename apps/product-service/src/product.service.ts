import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { RedisService } from './redis/redis.service';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';
import { updateStockDto } from './dto/update-stock.dto';
import { IProduct, IUser } from './helpers/interfaces';
import { KafkaEventService } from './kafka/kafka.service';

@Injectable()
export class ProductService {
  private readonly cache_ttl = 60

  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private redis: RedisService,
    private readonly kafkaService: KafkaEventService,
  ) { }

  private async invalidateProductCache(id?: string, sellerId?: string) {
    const keys = ['products:all'];
    if (id) keys.push(`product:${id}`);
    if (sellerId) keys.push(`products:seller:${sellerId}`);
    await Promise.all(keys.map((key) => this.redis.del(key)));
  }

  private async enrichProduct(products: Product[]) {
    const sellerIds = [...new Set(products.map(p => p.sellerId))];
    const sellers = await this.kafkaService.getSellersData(sellerIds) as IUser[];
    const sellersMap = new Map(sellers.map(u => [u.id, u]));
    return products.map(product => ({
      ...product,
      seller: sellersMap.get(product.sellerId),
    }));
  }

  async create(product: CreateProductDto) {
    const created = await this.repo.save(this.repo.create(product));
    await this.invalidateProductCache(undefined, product.sellerId);
    return created;
  }

  async findOne(id: string) {
    const cached = await this.redis.get<Product>(`product:${id}`);
    if (cached) return cached;

    const product = await this.repo.findOne({ where: { id, isDeleted: false } });
    if (!product) throw new NotFoundException('Product not found');

    const enrichedProducts = await this.enrichProduct([product]);

    await this.redis.set(`product:${id}`, enrichedProducts[0], this.cache_ttl);

    return enrichedProducts[0];
  }

  async findAll() {
    const cached = await this.redis.get<IProduct[]>('products:all');
    if (cached) return cached;

    const products = await this.repo.find({ where: { isDeleted: false } });
    if (!products.length) return [];

    const enrichedProducts = await this.enrichProduct(products);

    await this.redis.set('products:all', enrichedProducts, this.cache_ttl);

    return enrichedProducts;
  }

  async findProductIdsBySeller(sellerId: string) {
    const cached = await this.redis.get<string[]>(`products:seller:${sellerId}`);
    if (cached) return cached;

    const products = await this.repo.find({ where: { sellerId }, select: ['id'] });
    if (!products.length) return [];

    const productIds = products.map(product => product.id);
    await this.redis.set(`products:seller:${sellerId}`, productIds, this.cache_ttl);

    return productIds;
  }

  async findBulkProductDetails(productIds: string[]) {
    const cachedProducts = await Promise.all(
      productIds.map(id => this.redis.get<Product>(`product:${id}`))
    );

    const result: Product[] = [];
    const missingIds: string[] = [];

    cachedProducts.forEach((p, i) => {
      if (p) result.push(p);
      else missingIds.push(productIds[i]);
    });

    if (missingIds.length) {
      const fetched = await this.repo.find({ where: { id: In(missingIds) } });
      for (const product of fetched) {
        result.push(product);
      }
    }

    const enrichedProducts = await this.enrichProduct(result);

    for (const product of enrichedProducts) {
      await this.redis.set(`product:${product.id}`, product, this.cache_ttl);
    }

    return enrichedProducts;
  }

  async update(id: string, product: UpdateProductDto) {
    const existing = await this.repo.findOne({ where: { id } });
    await this.invalidateProductCache(id, existing?.sellerId);
    return this.repo.update(id, product);
  }

  async softDelete(id: string) {
    const existing = await this.repo.findOne({ where: { id } });
    await this.invalidateProductCache(id, existing?.sellerId);
    return this.repo.update(id, { isDeleted: true });
  }

  async delete(id: string) {
    const existing = await this.repo.findOne({ where: { id } });
    await this.invalidateProductCache(id, existing?.sellerId);
    return this.repo.delete(id);
  }

  async updateStockOrderCountUpdate({ items, type }: updateStockDto) {
    const queryRunner = this.repo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of items) {
        const { productId, quantity } = item;

        const product = await queryRunner.manager.findOne(Product, { where: { id: productId } });
        if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
        }

        if (type === 'increase') {
          product.stock += quantity;
          product.orderCount -= 1;
        } else if (type === 'decrease') {
          if (product.stock < quantity) {
            throw new Error(`Insufficient stock for product ID ${productId}`);
          }
          product.stock -= quantity;
          product.orderCount += 1;
        }

        await queryRunner.manager.update(Product, productId, product);
        await this.redis.del(`product:${productId}`);
      }

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
      throw new Error('Failed to update stock and order count');
    } finally {
      await queryRunner.release();
    }
  }
}
