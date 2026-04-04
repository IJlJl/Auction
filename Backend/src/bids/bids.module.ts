import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { Bid } from './entities/bid.entity';
import { Auction } from '../auctions/entities/auction.entity';
import { AuctionsModule } from '../auctions/auctions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Auction]), AuctionsModule],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
