import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KafkaEventService } from 'src/kafka/kafka.service';
import { OrderService } from 'src/order.service';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { CreateOrderDto } from 'src/dto/create.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: Repository<Order>;

  const mockKafkaService = {
    createTempUser: jest.fn().mockResolvedValue('temp-user-id'),
    notifyStockAndOrderCountUpdate: jest.fn(),
    getSellersData: jest.fn().mockResolvedValue([]),
    getProductsData: jest.fn().mockResolvedValue([]),
    getBuyersData: jest.fn().mockResolvedValue([]),
    fetchProductIdsBySeller: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Order, OrderItem],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Order, OrderItem]),
      ],
      providers: [
        OrderService,
        { provide: KafkaEventService, useValue: mockKafkaService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order with order items and temp user', async () => {
    const dto: CreateOrderDto = {
      email: 'test@example.com',
      firstname: 'John',
      lastname: 'Doe',
      shippingCost: 10,
      buyerId: '',
      shipping: 'Deliver',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      productQuantities: [
        { productId: 'p1', quantity: 2, unitPrice: 50 },
        { productId: 'p2', quantity: 1, unitPrice: 100 },
      ],
    };

    const result = await service.createOrder(dto);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('items');
    expect(mockKafkaService.createTempUser).toHaveBeenCalled();
    expect(mockKafkaService.notifyStockAndOrderCountUpdate).toHaveBeenCalled();
  });

  it('should throw NotFoundException for findOne with invalid id', async () => {
    await expect(service.findOne('non-existing-id')).rejects.toThrow(NotFoundException);
  });

  it('should return empty seller orders if no products', async () => {
    const result = await service.getOrdersBySeller('seller-id');
    expect(result).toEqual({ data: [], total: 0, currentPage: 1, pageSize: 10 });
  });

  it('should return empty buyer orders if none exist', async () => {
    const result = await service.getOrdersByBuyer('buyer-id');
    expect(result).toEqual({ data: [], total: 0, currentPage: 1, pageSize: 10 });
  });

  it('should cancel an order if it is pending', async () => {
    const dto: CreateOrderDto = {
      email: 'test@example.com',
      firstname: 'John',
      lastname: 'Doe',
      shippingCost: 10,
      buyerId: 'b1',
      shipping: 'Deliver',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      productQuantities: [
        { productId: 'p1', quantity: 2, unitPrice: 50 },
        { productId: 'p2', quantity: 1, unitPrice: 100 },
      ],
    };

    const orderWithItems = await service.createOrder(dto);
    const orderId = orderWithItems.id;

    const result = await service.cancelOrder(orderId, 'b1');

    expect(result.status).toBe('Cancelled');
  });

  it('should throw NotFoundException for cancelling non-existent order', async () => {
    await expect(service.cancelOrder('invalid-id', 'buyer-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for cancelling completed/cancelled order', async () => {
    const dto = {
      email: 'test@example.com',
      firstname: 'John',
      lastname: 'Doe',
      shippingCost: 10,
      buyerId: 'b2',
      shipping: 'Deliver',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      productQuantities: [
        { productId: 'p1', quantity: 2, unitPrice: 50 },
        { productId: 'p2', quantity: 1, unitPrice: 100 },
      ],
    };

    const order = await service.createOrder(dto);
    await orderRepo.update(order.id, { status: 'Completed' });

    await expect(service.cancelOrder(order.id, 'b2')).rejects.toThrow(BadRequestException);
  });

  it('should complete all pending orders via cron job', async () => {
    const dto = {
      email: 'test@example.com',
      firstname: 'John',
      lastname: 'Doe',
      shippingCost: 10,
      buyerId: 'b1',
      shipping: 'Deliver',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      productQuantities: [
        { productId: 'p5', quantity: 2, unitPrice: 50 },
        { productId: 'p4', quantity: 1, unitPrice: 100 },
      ],
    };

    await service.createOrder(dto);

    const result = await service.updatePendingOrdersToCompleted();
    expect(result.updated).toBeGreaterThanOrEqual(1);
  });
});
