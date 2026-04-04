import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { Auction } from './entities/auction.entity';
import { AuctionsGateway } from './auctions.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    TypeOrmModule.forFeature([Auction]),
    ClientsModule.register([
      {
        name: 'AUCTION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'auctions_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsGateway],
  exports: [AuctionsService, AuctionsGateway]
})
export class AuctionsModule {}