import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { v4 as uuidv4 } from 'uuid';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create.dto';
import { IProduct, IUser } from './helpers/interfaces';
import { KafkaEventService } from './kafka/kafka.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    private readonly kafkaService: KafkaEventService,
  ) { }

  private enrichOrders(orders: Order[], products: IProduct[], buyers: IUser[]) {
    const productsMap = new Map(products.map(p => [p.id, p]));
    const buyersMap = new Map(buyers.map(u => [u.id, u]));

    const enhanced = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: productsMap.get(item.productId),
      })),
      buyer: buyersMap.get(order.buyerId),
    }));

    return enhanced.map(order => ({
      ...order,
      items: order.items.filter(item => item.product),
    }));
  }

  async createOrder(body: CreateOrderDto) {
    const referenceNo = `ORD-${uuidv4().slice(0, 8)}`;

    let buyerId: string
    if (body.buyerId) {
      buyerId = body.buyerId
    } else {
      buyerId = await this.kafkaService.createTempUser(body.email, body.firstname, body.lastname)
    }

    const order = this.orderRepo.create({
      ...body,
      buyerId,
      status: 'Pending',
      referenceNo,
    });

    await this.orderRepo.save(order);

    const orderItems = body.productQuantities.map(item =>
      this.orderItemRepo.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })
    );

    await this.orderItemRepo.save(orderItems);

    this.kafkaService.notifyStockAndOrderCountUpdate({ type: 'decrease', items: body.productQuantities });

    return { ...order, items: orderItems };
  }

  async findOne(orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: ['items'] });

    if (!order) throw new NotFoundException('Order not found');

    const [productsMap, buyersMap] = await Promise.all([
      this.kafkaService.getProductsData(order.items.map(i => i.productId)),
      this.kafkaService.getBuyersData([order.buyerId]),
    ]);

    return this.enrichOrders([order], productsMap, buyersMap)[0];
  }

  async getOrdersBySeller(sellerId: string, page = 1, limit = 10) {
    const productIds = await this.kafkaService.fetchProductIdsBySeller(sellerId);

    if (!productIds.length) {
      return { data: [], total: 0, currentPage: page, pageSize: limit };
    }

    const orderItems = await this.orderItemRepo.find({ where: { productId: In(productIds) } });

    const orderIds = [...new Set(orderItems.map(item => item.orderId))];
    if (!orderIds.length) {
      return { data: [], total: 0, currentPage: page, pageSize: limit };
    }

    const [orders, total] = await this.orderRepo.findAndCount({
      where: { id: In(orderIds) },
      relations: ['items'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    const [productsMap, buyersMap] = await Promise.all([
      this.kafkaService.getProductsData([...new Set(orders.flatMap(order => order.items.map(items => items.productId)))]),
      this.kafkaService.getBuyersData([...new Set(orders.map(order => order.buyerId))]),
    ]);

    const enrichedOrders = this.enrichOrders(orders, productsMap, buyersMap);

    const filteredOrders = enrichedOrders.map(order => ({
      ...order,
      items: order.items.filter(item => productIds.includes(item.productId)),
    }));

    return {
      data: filteredOrders,
      total,
      currentPage: page,
      pageSize: limit,
    };
  }

  async getOrdersByBuyer(buyerId: string, page = 1, limit = 10) {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: { buyerId },
      relations: ['items'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    if (!orders.length) {
      return { data: [], total: 0, currentPage: page, pageSize: limit };
    }

    const [productsMap, buyersMap] = await Promise.all([
      this.kafkaService.getProductsData([...new Set(orders.flatMap(order => order.items.map(items => items.productId)))]),
      this.kafkaService.getBuyersData([buyerId]),
    ]);

    return {
      data: this.enrichOrders(orders, productsMap, buyersMap),
      total,
      currentPage: page,
      pageSize: limit,
    };
  }

  async cancelOrder(orderId: string, buyerId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, buyerId } });

    if (!order) throw new NotFoundException('Order not found');

    if (['Completed', 'Cancelled'].includes(order.status)) {
      throw new BadRequestException(`Order is already ${order.status.toLowerCase()}`);
    }

    order.status = 'Cancelled';
    await this.orderRepo.save(order);

    const orderItems = await this.orderItemRepo.find({ where: { orderId } });

    this.kafkaService.notifyStockAndOrderCountUpdate({ type: 'increase', items: orderItems });

    return order;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updatePendingOrdersToCompleted() {
    const pendingOrders = await this.orderRepo.find({ where: { status: 'Pending' } });

    if (!pendingOrders.length) return { updated: 0 };

    await this.orderRepo.save(pendingOrders.map(order => ({
      ...order,
      status: 'Completed',
    })));

    return { updated: pendingOrders.length };
  }
}
