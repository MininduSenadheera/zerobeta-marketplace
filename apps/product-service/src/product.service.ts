import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, QueryFailedError, Repository } from 'typeorm';
import { RedisService } from './redis/redis.service';
import { CreateProductDto } from './dto/create.dto';
import { UpdateProductDto } from './dto/update.dto';
import { updateStockDto } from './dto/update-stock.dto';
import { IProduct } from './helpers/interfaces';
import { KafkaEventService } from './kafka/kafka.service';

@Injectable()
export class ProductService {
  private readonly cache_ttl = 60;

  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private redis: RedisService,
    private readonly kafkaService: KafkaEventService,
  ) { }

  private async invalidateProductCache(id?: string, sellerId?: string) {
    try {
      const keys = ['products:all'];
      if (id) keys.push(`product:${id}`);
      if (sellerId) {
        keys.push(`products:seller:${sellerId}`);
        keys.push(`products:seller:full:${sellerId}`);
      }
      await Promise.all(keys.map((key) => this.redis.del(key)));
    } catch (error) {
      throw new InternalServerErrorException('Cache invalidation failed');
    }
  }

  private async enrichProduct(products: Product[]) {
    try {
      const sellerIds = [...new Set(products.map(p => p.sellerId))];
      const sellers = await this.kafkaService.getSellersData(sellerIds);
      const sellersMap = new Map(sellers.map(u => [u.id, u]));

      return products.map(product => ({
        ...product,
        seller: sellersMap.get(product.sellerId),
      }));
    } catch (error) {
      throw new InternalServerErrorException('Failed to enrich product data');
    }
  }

  async create(product: CreateProductDto) {
    try {
      const created = await this.repo.save(this.repo.create(product));
      await this.invalidateProductCache(undefined, product.sellerId);
      return created;
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError.code === '23505') {
        throw new ConflictException('Product with this name or code already exists');
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findOne(id: string) {
    try {
      const cached = await this.redis.get<Product>(`product:${id}`);
      if (cached) return cached;

      const product = await this.repo.findOne({ where: { id, isDeleted: false } });
      if (!product) throw new NotFoundException('Product not found');

      const enriched = await this.enrichProduct([product]);
      await this.redis.set(`product:${id}`, enriched[0], this.cache_ttl);

      return enriched[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve product');
    }
  }

  async findAll() {
    try {
      const cached = await this.redis.get<IProduct[]>('products:all');
      if (cached) return cached;

      const products = await this.repo.find({ where: { isDeleted: false } });
      if (!products.length) return [];

      const enriched = await this.enrichProduct(products);
      await this.redis.set('products:all', enriched, this.cache_ttl);

      return enriched;
    } catch {
      throw new InternalServerErrorException('Failed to retrieve all products');
    }
  }

  async findProductsBySeller(sellerId: string) {
    try {
      const cacheKey = `products:seller:full:${sellerId}`;
      const cached = await this.redis.get<IProduct[]>(cacheKey);
      if (cached) return cached;

      const products = await this.repo.find({ where: { sellerId } });
      if (!products.length) return [];

      const enriched = await this.enrichProduct(products);
      await this.redis.set(cacheKey, enriched, this.cache_ttl);

      return enriched;
    } catch {
      throw new InternalServerErrorException('Failed to fetch products by seller');
    }
  }

  async findProductIdsBySeller(sellerId: string) {
    try {
      const cached = await this.redis.get<string[]>(`products:seller:${sellerId}`);
      if (cached) return cached;

      const products = await this.repo.find({ where: { sellerId }, select: ['id'] });
      if (!products.length) return [];

      const productIds = products.map(product => product.id);
      await this.redis.set(`products:seller:${sellerId}`, productIds, this.cache_ttl);

      return productIds;
    } catch {
      throw new InternalServerErrorException('Failed to fetch product IDs by seller');
    }
  }

  async findBulkProductDetails(productIds: string[]) {
    try {
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
        result.push(...fetched);
      }

      const enriched = await this.enrichProduct(result);

      for (const product of enriched) {
        await this.redis.set(`product:${product.id}`, product, this.cache_ttl);
      }

      return enriched;
    } catch {
      throw new InternalServerErrorException('Failed to retrieve bulk product details');
    }
  }

  async update(id: string, product: UpdateProductDto, sellerId: string) {
    try {
      const existing = await this.repo.findOne({ where: { id, sellerId } });
      if (!existing) throw new NotFoundException('Product not found or you are not the owner');
      await this.invalidateProductCache(id, sellerId);
      await this.repo.update(id, product);
      return { message: 'Product updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async softDelete(id: string, sellerId: string) {
    try {
      const existing = await this.repo.findOne({ where: { id, sellerId } });
      if (!existing) throw new NotFoundException('Product not found or you are not the owner');
      await this.invalidateProductCache(id, sellerId);
      await this.repo.update(id, { isDeleted: true });
      return { message: 'Product soft deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to soft delete product');
    }
  }

  async delete(id: string, sellerId: string) {
    try {
      const existing = await this.repo.findOne({ where: { id, sellerId } });
      if (!existing) throw new NotFoundException('Product not found or you are not the owner');
      await this.invalidateProductCache(id, sellerId);
      await this.repo.delete(id);
      return { message: 'Product permanently deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete product');
    }
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
          throw new BadRequestException(`Product with ID ${productId} not found`);
        }

        if (type === 'increase') {
          product.stock += quantity;
          product.orderCount = Math.max(0, product.orderCount - 1);
        } else if (type === 'decrease') {
          if (product.stock < quantity) {
            throw new BadRequestException(`Insufficient stock for product ID ${productId}`);
          }
          product.stock -= quantity;
          product.orderCount += 1;
        }

        await queryRunner.manager.update(Product, productId, product);
        await this.redis.del(`product:${productId}`);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update stock/order count');
    } finally {
      await queryRunner.release();
    }
  }
}
