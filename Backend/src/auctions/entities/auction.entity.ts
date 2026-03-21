import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AuctionStatus {
  ACTIVE = 'active',
  FINISHED = 'finished',
}

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  startPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentPrice!: number;

  @Column({ type: 'timestamp' })
  endsAt!: Date;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.ACTIVE,
  })
  status!: AuctionStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}