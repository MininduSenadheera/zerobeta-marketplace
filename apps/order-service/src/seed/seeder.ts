import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) { }

  async onApplicationBootstrap() {
    const existing = await this.orderRepository.count();
    if (existing > 0) return;

    const orders: Partial<Order>[] = [
      { 
        id: '6c38304a-bd7b-4af8-90fe-6084cf7986a3',
        referenceNo: 'ORD-JANE-001',
        address: '123 Baker Street',
        city: 'London',
        country: 'UK',
        shipping: 'Pickup',
        shippingCost: 0,
        status: 'Pending',
        buyerId: 'a35e40b9-d02d-4b8f-ae6a-63c805fcef95',
      },
      {
        id: 'd1e7ae01-c02c-46d3-b164-3196f156fbc6',
        referenceNo: 'ORD-BOB-001',
        address: '456 Elm Street',
        city: 'New York',
        country: 'USA',
        shipping: 'Deliver',
        shippingCost: 1.99,
        status: 'Pending',
        buyerId: '1af3d3d6-e616-46e1-8c30-35b32149f328',
      },
    ];

    const orderItems = [
      {
        orderId: '6c38304a-bd7b-4af8-90fe-6084cf7986a3',
        productId: '1068453c-267e-4ad1-91b7-feeadd759dfa',
        quantity: 2,
        unitPrice: 19.99
      },
      {
        orderId: '6c38304a-bd7b-4af8-90fe-6084cf7986a3',
        productId: '2068453c-267e-4ad1-91b7-feeadd759dfa',
        quantity: 1,
        unitPrice: 19.99
      },
      {
        orderId: 'd1e7ae01-c02c-46d3-b164-3196f156fbc6',
        productId: 'ed6a2d1d-8a71-40c8-8d23-5f161a05b4ad',
        quantity: 3,
        unitPrice: 29.99
      },
      {
        orderId: 'd1e7ae01-c02c-46d3-b164-3196f156fbc6',
        productId: '9664e65e-7d9c-4408-8b33-6703910bd707',
        quantity: 1,
        unitPrice: 29.99
      },
    ]

    await this.orderRepository.save(orders);
    await this.orderItemRepository.save(orderItems);

    console.log('Seeded initial orders.');
  }
}
