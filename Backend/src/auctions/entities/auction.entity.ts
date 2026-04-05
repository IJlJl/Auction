import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Bid } from '../../bids/entities/bid.entity';

export enum AuctionStatus {
  ACTIVE = 'active',
  FINISHED = 'finished',
}

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.auctions)
  @JoinColumn({ name: 'creatorId' })
  creator!: User;

  @Column()
  creatorId!: string; 


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

  @Column({ nullable: true })
imageUrl!: string;
  
@OneToMany(() => Bid, (bid) => bid.auction)
bids!: Bid[];

}