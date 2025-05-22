import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderItem } from './entities/order-item.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { KafkaEventService } from './kafka/kafka.service';
import { OrderSeeder } from './seed/seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order-service-product-client',
            brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
          },
          consumer: {
            groupId: 'order-service-product-consumer',
          },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order-service-user-client',
            brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
          },
          consumer: {
            groupId: 'order-service-user-consumer',
          },
        },
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [OrderController],
  providers: [OrderService, KafkaEventService, OrderSeeder],
})
export class OrderModule { }
