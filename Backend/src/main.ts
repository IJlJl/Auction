import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── CORS: дозволяємо тільки фронтенд-домен ────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // ── Глобальна валідація DTO через class-validator ──────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,             // Видаляє зайві поля з body
      forbidNonWhitelisted: true,  // 400 якщо є непозначені поля
      transform: true,             // Автоматично перетворює типи (string → number)
    }),
  );

  // ── Статичні файли (завантажені зображення) ────────────────────────────────
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // ── RabbitMQ мікросервіс ───────────────────────────────────────────────────
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'auctions_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('✅ Бекенд запущено на http://localhost:3000');
  console.log('📁 Статичні файли доступні у /uploads');
}
bootstrap();