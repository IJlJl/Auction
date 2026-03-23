import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuctionsModule } from './auctions/auctions.module';
import { Auction } from './auctions/entities/auction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

  TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5433', 10),
  username: process.env.DATABASE_USER || 'user',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'db',
  autoLoadEntities: true, 
  synchronize: true,
}),

    AuctionsModule,
  ],
})
export class AppModule {}