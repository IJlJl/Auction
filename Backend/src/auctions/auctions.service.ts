import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction, AuctionStatus } from './entities/auction.entity'; 
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { ClientProxy } from '@nestjs/microservices';
import { AuctionsGateway } from './auctions.gateway';


@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    
    @Inject('AUCTION_SERVICE') 
    private readonly client: ClientProxy, 

    private readonly auctionsGateway: AuctionsGateway, 
  ) {}

  async create(createAuctionDto: CreateAuctionDto, userId: string, imageUrl?: string) { 
  const auction = this.auctionRepository.create({
    ...createAuctionDto,
    creatorId: userId,
    imageUrl: imageUrl,
  });

  const savedAuction = await this.auctionRepository.save(auction);

  const delay = new Date(savedAuction.endsAt).getTime() - new Date().getTime();
  this.client.emit('auction_created', { 
    auctionId: savedAuction.id, 
    delay: delay > 0 ? delay : 0 
  });

  return savedAuction;
}

 
  async closeAuction(id: string) {
  const auction = await this.findOne(id);
  
  if (auction.status === AuctionStatus.FINISHED) return; 
  
  auction.status = AuctionStatus.FINISHED;
  await this.auctionRepository.save(auction);

 
  this.auctionsGateway.server.emit('auctionFinished', { auctionId: id });
  
  console.log(` Аукціон ${id} збережено в базі як FINISHED`);
}

 async findAll() {
  return await this.auctionRepository.find({
    
    relations: ['bids', 'bids.bidder'], 
    
    order: {
      createdAt: 'DESC', 
    }
  });
}

  async findOne(id: string) { 
    const auction = await this.auctionRepository.findOneBy({ id });
    if (!auction) {
      throw new NotFoundException(`Аукціон з ID ${id} не знайдено`);
    }
    return auction;
  }

  async update(id: string, updateAuctionDto: UpdateAuctionDto) {
    const auction = await this.findOne(id);
    const updated = Object.assign(auction, updateAuctionDto); 
    return await this.auctionRepository.save(updated);
  }

  async remove(id: string) {
    const auction = await this.findOne(id);
    return await this.auctionRepository.remove(auction);
  }

}