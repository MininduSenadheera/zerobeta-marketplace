import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async onApplicationBootstrap() {
    const count = await this.productRepository.count();
    if (count > 0) return;

    const products = [
      {
        id: '1068453c-267e-4ad1-91b7-feeadd759dfa',
        code: 'P001',
        name: 'Sample Product 1',
        description: 'Description for Product 1',
        price: 19.99,
        stock: 100,
        orderCount: 1,
        isDeleted: false,
        sellerId: '6a998bc9-76b9-44a6-8fcd-a6a5b1a877ba',
      },
      {
        id: '2068453c-267e-4ad1-91b7-feeadd759dfa',
        code: 'P002',
        name: 'Sample Product 2',
        description: 'Description for Product 2',
        price: 19.99,
        stock: 100,
        orderCount: 1,
        isDeleted: false,
        sellerId: '6a998bc9-76b9-44a6-8fcd-a6a5b1a877ba',
      },
      {
        id: 'ed6a2d1d-8a71-40c8-8d23-5f161a05b4ad',
        code: 'P003',
        name: 'Sample Product 3',
        description: 'Description for Product 3',
        price: 29.99,
        stock: 60,
        orderCount: 1,
        isDeleted: false,
        sellerId: 'a9a1301f-f671-4387-a9ec-048d5d0d983a',
      },
      {
        id: '9664e65e-7d9c-4408-8b33-6703910bd707',
        code: 'P004',
        name: 'Sample Product 4',
        description: 'Description for Product 4',
        price: 29.99,
        stock: 60,
        orderCount: 1,
        isDeleted: false,
        sellerId: 'a9a1301f-f671-4387-a9ec-048d5d0d983a',
      }
    ];

    await this.productRepository.save(products);
    console.log('Seeded initial products.');
  }
}
