import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices'; // 1. ПЕРЕВІР ЦЕЙ ІМПОРТ
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  async create(@Body() createAuctionDto: CreateAuctionDto) {
    return await this.auctionsService.create(createAuctionDto);
  }

  @Get()
  async findAll() {
    return await this.auctionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.auctionsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAuctionDto: UpdateAuctionDto) {
    return await this.auctionsService.update(id, updateAuctionDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.auctionsService.remove(id);
  }

 
  @MessagePattern('auction_created')
  async handleAuctionCreated(@Payload() data: { auctionId: string, delay: number }) {
    console.log(`[RabbitMQ] Отримано завдання: закрити аукціон ${data.auctionId} через ${data.delay} мс`);

    setTimeout(async () => {
      console.log(`[Timer] Час вийшов для аукціону ${data.auctionId}. Закриваємо...`);
      await this.auctionsService.closeAuction(data.auctionId);
    }, data.delay);
  }
} 