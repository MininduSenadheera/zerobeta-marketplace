import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { IUser } from "src/helpers/interfaces";

@Injectable()
export class KafkaEventService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka
  ) { }

  async onModuleInit() {
    await this.userClient.connect();
  }

  async getSellersData(userIds: string[]): Promise<IUser[]> {
    try {
      if (!userIds.length) return [];
      const { sellers } = await firstValueFrom<{ sellers: IUser[] }>(
        this.userClient.send('user.get.bulk', { userIds })
      );
      return sellers;
    } catch {
      throw new ServiceUnavailableException('Failed to fetch seller details');
    }
  }
}