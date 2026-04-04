import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();


  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'auctions_queue',
      queueOptions: { durable: false },
    },
  });

  
  await app.startAllMicroservices();
  await app.listen(3000);
  
  console.log('Backend is running with RabbitMQ support');
}
bootstrap();