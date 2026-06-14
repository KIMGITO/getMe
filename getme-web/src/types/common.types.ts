// src/types/common.types.ts
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Theme = 'light' | 'dark';
export type UserRole = 'admin' | 'client' | 'rider';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}