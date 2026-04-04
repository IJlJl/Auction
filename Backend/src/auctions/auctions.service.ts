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

  async create(createAuctionDto: CreateAuctionDto) { 
    const auction = this.auctionRepository.create(createAuctionDto);
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

  auction.status = AuctionStatus.FINISHED; 
  await this.auctionRepository.save(auction);

  
  this.auctionsGateway.server.emit('auctionFinished', { 
    auctionId: id, 
    title: auction.title 
  });


    console.log(`Аукціон ${id} офіційно закрито!`);
  }

  async findAll() {
    return await this.auctionRepository.find();
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