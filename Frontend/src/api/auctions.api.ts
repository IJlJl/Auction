import { apiClient } from './client';
import type { Auction } from '../types';
export const auctionsApi = {

  getAll: () => {
    return apiClient<Auction[]>('/auctions');
  },

  getById: (id: string) => {
    return apiClient<Auction>(`/auctions/${id}`);
  },
 
  create: (formData: FormData) => {
    return apiClient<Auction>('/auctions', {
      method: 'POST',
      body: formData,
    });
  },
};