import { apiClient } from './client';
import type { AuthResponse, User } from '../types';
export const authApi = {
  
  login: (data: { email: string; password: string }) => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
 
  register: (data: { email: string; password: string; nickname: string }) => {
    return apiClient<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};