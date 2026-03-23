export class CreateAuctionDto {
  title!: string;
  description?: string;
  startPrice!: number;
  endsAt!: string;
}