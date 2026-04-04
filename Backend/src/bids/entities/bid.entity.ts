import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Auction }  from "../../auctions/entities/auction.entity";

@Entity('bids')
export class Bid {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => Auction, auction => auction.id, { onDelete: 'CASCADE' })
    auction!: Auction;

    @Column()
    auctionId!: string;
}
