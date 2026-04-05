import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, UseInterceptors, UploadedFile, ParseUUIDPipe, 
} from '@nestjs/common'; 
import { FileInterceptor } from '@nestjs/platform-express'; 
import { diskStorage } from 'multer'; 
import { extname } from 'path'; 
import { MessagePattern, Payload } from '@nestjs/microservices'; 
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

 @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
       
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async create(
    @Body() createAuctionDto: CreateAuctionDto, 
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File 
  ) {
    
    const imageUrl = file ? `/uploads/${file.filename}` : undefined;
    
    return await this.auctionsService.create(createAuctionDto, req.user.userId, imageUrl);
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
