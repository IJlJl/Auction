import { IsString, IsNumber, IsDateString, IsPositive, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAuctionDto {
  @IsString()
  @MinLength(3, { message: 'Назва мінімум 3 символи' })
  @MaxLength(100, { message: 'Назва максимум 100 символів' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive({ message: 'Ціна має бути більше 0' })
  startPrice!: number;

  @IsDateString({}, { message: 'Некоректний формат дати' })
  endsAt!: string;
}