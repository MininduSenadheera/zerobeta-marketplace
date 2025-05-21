import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from 'src/product.service';
import { Product } from 'src/entities/product.entity';
import { RedisService } from 'src/redis/redis.service';
import { KafkaEventService } from 'src/kafka/kafka.service';
import { CreateProductDto } from 'src/dto/create.dto';

describe('ProductService', () => {
  let service: ProductService;
  let repo: Repository<Product>;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockKafkaService = {
    getSellersData: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Product],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Product]),
      ],
      providers: [
        ProductService,
        { provide: RedisService, useValue: mockRedisService },
        { provide: KafkaEventService, useValue: mockKafkaService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create and return the product', async () => {
      const dto: CreateProductDto = {
        name: 'Laptop',
        price: 999,
        stock: 50,
        code: 'LAP123',
        description: 'High-end gaming laptop',
        sellerId: 'seller-1',
      };

      const result = await service.create(dto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Laptop');
      expect(mockRedisService.del).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return enriched product from DB when not cached', async () => {
      const saved = await repo.save(
        repo.create({
          name: 'Phone',
          code: 'PHN123',
          description: 'Latest smartphone',
          price: 500,
          stock: 20,
          sellerId: 'seller-2',
          isDeleted: false,
        })
      );

      mockRedisService.get.mockResolvedValueOnce(null);

      const result = await service.findOne(saved.id);

      expect(result.name).toBe('Phone');
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should return product from cache if present', async () => {
      const cached = {
        id: '4',
        name: 'Cached Product',
        price: 200,
        stock: 15,
        sellerId: 'seller-3',
      };
      mockRedisService.get.mockResolvedValueOnce(cached);

      const result = await service.findOne('4');

      expect(result).toEqual(cached);
      expect(mockKafkaService.getSellersData).not.toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('should return all products from DB when not cached', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);

      const result = await service.findAll();

      expect(result.length).toBeGreaterThan(0);
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should return products from cache if present', async () => {
      const cachedProducts = [{ id: 'cached-id', name: 'Cached Product' }];
      mockRedisService.get.mockResolvedValueOnce(cachedProducts);

      const result = await service.findAll();

      expect(result).toEqual(cachedProducts);
    });
  });

  describe('findProductsBySeller()', () => {
    it('should return seller products from DB when not cached', async () => {

      await repo.save(
        repo.create({
          name: 'iPhone',
          code: 'PHN1234',
          description: 'Latest smartphone',
          price: 500,
          stock: 20,
          sellerId: 'seller-4',
          isDeleted: false,
        })
      );

      mockRedisService.get.mockResolvedValueOnce(null);

      const result = await service.findProductsBySeller('seller-4');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('iPhone');
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should return seller products from cache if present', async () => {
      const cached = [{ id: '1', name: 'Cached', sellerId: 'seller-1' }];
      mockRedisService.get.mockResolvedValueOnce(cached);

      const result = await service.findProductsBySeller('seller-1');

      expect(result).toEqual(cached);
    });
  });

  describe('findProductIdsBySeller()', () => {
    it('should return product IDs from DB when not cached', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);

      const result = await service.findProductIdsBySeller('seller-1');

      expect(result.length).toBeGreaterThan(0);
      expect(typeof result[0]).toBe('string');
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should return product IDs from cache if present', async () => {
      const cached = ['id1', 'id2'];
      mockRedisService.get.mockResolvedValueOnce(cached);

      const result = await service.findProductIdsBySeller('seller-1');

      expect(result).toEqual(cached);
    });
  });

  describe('update()', () => {
    it('should update a product if owned by seller', async () => {
      const product = await repo.save(repo.create({
        name: 'Product',
        code: 'U123',
        price: 100,
        stock: 10,
        description: 'Product Description',
        sellerId: 'seller-1',
      }));

      const updateDto = { name: 'Updated Name', price: 150, stock: 20, description: 'Product Description' };

      const result = await service.update(product.id, updateDto, 'seller-1');
      expect(result.affected).toBe(1);
    });

    it('should throw if product not found or unauthorized', async () => {
      const updateDto = { name: 'Updated Name', price: 150, stock: 20, description: 'Product Description' };
      await expect(
        service.update('invalid-id', updateDto, 'seller-1')
      ).rejects.toThrow('Product not found Or You are not the owner');
    });
  });

  describe('softDelete()', () => {
    it('should mark product as deleted if seller owns it', async () => {
      const product = await repo.save(repo.create({
        name: 'To Be Soft Deleted',
        code: 'SD123',
        description: 'Product to be soft deleted',
        price: 100,
        stock: 5,
        sellerId: 'seller-1',
      }));

      const result = await service.softDelete(product.id, 'seller-1');
      expect(result.affected).toBe(1);

      const updated = await repo.findOneBy({ id: product.id });
      expect(updated?.isDeleted).toBe(true);
    });

    it('should throw if product not found or unauthorized', async () => {
      await expect(
        service.softDelete('invalid-id', 'seller-1')
      ).rejects.toThrow('Product not found Or You are not the owner');
    });
  });


  describe('delete()', () => {
    it('should delete the product if owned by seller', async () => {
      const product = await repo.save(repo.create({
        name: 'Hard Delete',
        code: 'HD123',
        description: 'Product to be hard deleted',
        price: 200,
        stock: 10,
        sellerId: 'seller-1',
      }));

      const result = await service.delete(product.id, 'seller-1');
      expect(result.affected).toBe(1);

      const found = await repo.findOneBy({ id: product.id });
      expect(found).toBeNull();
    });

    it('should throw if product not found or unauthorized', async () => {
      await expect(
        service.delete('invalid-id', 'seller-1')
      ).rejects.toThrow('Product not found Or You are not the owner');
    });
  });


  describe('findBulkProductDetails()', () => {
    it('should return enriched details for multiple products', async () => {
      const product1 = await repo.save(repo.create({
        name: 'Bulk Product 1',
        description: 'Description for bulk product 1',
        code: 'BP1',
        price: 50,
        stock: 20,
        sellerId: 'seller-1',
      }));

      const product2 = await repo.save(repo.create({
        name: 'Bulk Product 2',
        description: 'Description for bulk product 2',
        code: 'BP2',
        price: 75,
        stock: 15,
        sellerId: 'seller-2',
      }));

      mockRedisService.get.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      const result = await service.findBulkProductDetails([product1.id, product2.id]);

      expect(result.length).toBe(2);
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
    });
  });

});
