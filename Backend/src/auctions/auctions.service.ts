import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './entities/auction.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
  ) {}

 
  async create(createAuctionDto: CreateAuctionDto) { 
    const auction = this.auctionRepository.create(createAuctionDto);
    return await this.auctionRepository.save(auction);
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