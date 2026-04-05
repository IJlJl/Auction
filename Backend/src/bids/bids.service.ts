import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './entities/bid.entity';
import { Auction, AuctionStatus } from '../auctions/entities/auction.entity'; 
import { AuctionsGateway } from '../auctions/auctions.gateway'; 

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>, 

    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>, 

    private readonly auctionsGateway: AuctionsGateway,
  ) {}

 async create(auctionId: string, amount: number, userId: string) {
  
  const auction = await this.auctionRepository.findOneBy({ id: auctionId });
  if (!auction) throw new BadRequestException('Аукціон не знайдено');

  console.log(`[BID ATTEMPT] Аукціон ID: ${auctionId}`);
  console.log(`[BID ATTEMPT] Поточний статус у базі: "${auction.status}"`);
  console.log(`[BID ATTEMPT] Тип статусу: ${typeof auction.status}`);


  
 if (String(auction.status) === 'finished' || auction.status === AuctionStatus.FINISHED) {
  console.log('!!! СТАВКА ВІДХИЛЕНА: СТАТУС FINISHED !!!');
  throw new BadRequestException('Ставки не приймаються: аукціон уже завершено!');
}

  
  const currentPrice = Number(auction.currentPrice) || Number(auction.startPrice);
  if (amount <= currentPrice) {
    throw new BadRequestException('Ставка має бути вищою за поточну ціну');
  }

  
  const bid = this.bidRepository.create({ amount, auctionId, bidderId: userId });
  await this.bidRepository.save(bid);

  auction.currentPrice = amount;
  await this.auctionRepository.save(auction);

  this.auctionsGateway.notifyPriceUpdate(auctionId, amount);

  return bid;
}
}
