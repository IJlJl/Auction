import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

 @UseGuards(JwtAuthGuard) 
  @Post()
  async create(@Body() createBidDto: CreateBidDto, @Req() req: any) {
    
    return await this.bidsService.create(
      createBidDto.auctionId, 
      createBidDto.amount, 
      req.user.userId
    );
  }

  // @Get('auction/:auctionId')
  // findAllByAuction(@Param('auctionId') auctionId: string) {
    
  // }
 
}
