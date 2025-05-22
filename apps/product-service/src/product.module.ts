import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'ioredis';
import { RedisService } from './redis/redis.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaEventService } from './kafka/kafka.service';
import { ProductSeeder } from './seed/seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 60,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'product-service-user-client',
            brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
          },
          consumer: {
            groupId: 'product-service-user-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, RedisService, KafkaEventService, ProductSeeder],
})
export class ProductModule { }
