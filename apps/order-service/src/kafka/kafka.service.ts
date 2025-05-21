import { Inject, Injectable, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { IProduct, IStockUpdatePayload, IUser } from "src/helpers/interfaces";

@Injectable()
export class KafkaEventService implements OnModuleInit {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientKafka,
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka
  ) { }

  async onModuleInit() {
    this.userClient.subscribeToResponseOf('user.create.temp');
    this.userClient.subscribeToResponseOf('user.get.bulk');
    this.productClient.subscribeToResponseOf('product.get.details.bulk');
    await this.productClient.connect();
    await this.userClient.connect();
  }

  notifyStockAndOrderCountUpdate({ type, items }: IStockUpdatePayload) {
    this.productClient.emit<IStockUpdatePayload>('product.stock.orderCount.update', {
      type,
      items,
    });
  }

  async getProductsData(productIds: string[]): Promise<IProduct[]> {
    try {
      if (!productIds.length) return [];
      const products = await firstValueFrom<IProduct[]>(
        this.productClient.send('product.get.details.bulk', { productIds })
      );
      return products;
    } catch {
      throw new ServiceUnavailableException('Failed to fetch product details');
    }
  }

  async getBuyersData(userIds: string[]): Promise<IUser[]> {
    try {
      if (!userIds.length) return [];
      const buyers  = await firstValueFrom<IUser[]>(
        this.userClient.send('user.get.bulk', { userIds })
      );
      return buyers;
    } catch {
      throw new ServiceUnavailableException('Failed to fetch buyer details');
    }
  }

  async createTempUser(email: string, firstName: string, lastName: string): Promise<string> {
    try {
      const { id } = await firstValueFrom<{ id: string }>(
        this.userClient.send('user.create.temp', { email, firstName, lastName })
      );
      return id;
    } catch {
      throw new ServiceUnavailableException('Failed to fetch user details');
    }
  }

  async fetchProductIdsBySeller(sellerId: string): Promise<string[]> {
    try {
      const productIds = await firstValueFrom<string[]>(
        this.productClient.send('product.ids.by.seller', { sellerId })
      );
      return productIds;
    } catch {
      throw new ServiceUnavailableException('Failed to fetch products by seller');
    }
  }
}