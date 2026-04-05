import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Auction }  from "../../auctions/entities/auction.entity";
import { User } from '../../users/entities/user.entity';

@Entity('bids')
export class Bid {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'bidderId' })
    bidder!: User;

    @Column()
    bidderId!: string; 


    @Column('decimal', { precision: 10, scale: 2 })
    amount!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => Auction, auction => auction.id, { onDelete: 'CASCADE' })
    auction!: Auction;

    @Column()
    auctionId!: string;
}
