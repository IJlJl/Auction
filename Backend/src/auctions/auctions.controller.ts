import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Req, UseInterceptors, UploadedFile, ParseUUIDPipe,
  ForbiddenException, NotFoundException,
} from '@nestjs/common'; 
import { FileInterceptor } from '@nestjs/platform-express'; 
import { diskStorage } from 'multer'; 
import { extname } from 'path'; 
import { MessagePattern, Payload } from '@nestjs/microservices'; 
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Дозволені MIME-типи для зображень
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
      if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Дозволені тільки зображення (${ALLOWED_IMAGE_TYPES.join(', ')})`), false);
      }
    },
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateAuctionDto: UpdateAuctionDto,
    @Req() req: any,
  ) {
    const auction = await this.auctionsService.findOne(id);
    if (!auction) throw new NotFoundException('Аукціон не знайдено');
    // Тільки власник може редагувати
    if (auction.creatorId !== req.user.userId) {
      throw new ForbiddenException('Редагувати може тільки власник аукціону');
    }
    return await this.auctionsService.update(id, updateAuctionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    const auction = await this.auctionsService.findOne(id);
    if (!auction) throw new NotFoundException('Аукціон не знайдено');
    // Тільки власник може видалити
    if (auction.creatorId !== req.user.userId) {
      throw new ForbiddenException('Видаляти може тільки власник аукціону');
    }
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
