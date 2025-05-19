import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'product-service-order-client',
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
      },
      consumer: {
        groupId: 'product-service-order-consumer',
      },
      retry: {
        retries: 10,
        initialRetryTime: 300,
      }
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Product Service API')
    .setDescription('API docs for products micro service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();