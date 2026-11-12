export interface User {
    id: string;
    email: string;
    nickname: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface Bid {
    id: string;
    amount: number;
    auctionId: string;
    bidderId?: string;
    createdAt?: string;
    bidder?:{
        nickname: string;
    };
}

export type AuctionStatus = 'active' | 'finished';

export interface Auction {
    id: string;
    title: string;
    description: string;
    startPrice: string|number;
    currentPrice: string|number;
    endsAt: string;
    status: AuctionStatus;
    creatorId: string;
    imageUrl?: string;
    bids?: Bid[];
}

export interface PriceUpdatedPayload {
    auctionId: string;
    newPrice: number;
}

export interface AuctionFinishedPayload {
    auctionId: string;
}