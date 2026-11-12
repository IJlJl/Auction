import { apiClient } from './client';
import type { Bid } from '../types';
export const bidsApi = {
  
  placeBid: (data: { auctionId: string; amount: number }) => {
    return apiClient<Bid>('/bids', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};