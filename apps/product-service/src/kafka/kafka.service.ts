import { Inject, Injectable, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { IUser } from "src/helpers/interfaces";

@Injectable()
export class KafkaEventService implements OnModuleInit {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka
  ) { }

  async onModuleInit() {
    this.userClient.subscribeToResponseOf('user.get.bulk');
    this.userClient.subscribeToResponseOf('user.validate.token');
    await this.userClient.connect();
  }

  async getSellersData(userIds: string[]): Promise<IUser[]> {
    try {
      if (!userIds.length) return [];
      const sellers: IUser[] = await firstValueFrom<IUser[]>(
        this.userClient.send('user.get.bulk', userIds)
      );
      return sellers;
    } catch {
      throw new ServiceUnavailableException('Failed to fetch seller details');
    }
  }

  async validateToken(token: string): Promise<IUser> {
    try {
      const user: IUser = await firstValueFrom<IUser>(
        this.userClient.send('user.validate.token', token)
      );
      return user;
    } catch {
      throw new ServiceUnavailableException('Failed to validate token');
    }
  }
}