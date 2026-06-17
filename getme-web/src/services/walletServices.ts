import { TransactionStatus, TransactionTypes } from '@/types/common.types';
import { apiClient } from './apiClient';

export interface Wallet {
  id: string;
  ledger_accountId: string;
  cached_balance: number;
  cached_held_balance: number;
  currancy: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionLog {
  id: string;
  transaction_code: string;
  type: TransactionTypes;
  amount: number;
  created_at: string;
  status: TransactionStatus;
  description?: string;
  transactions?: any
}

export interface WalletResponse {
  success: boolean;
  message: string;
  checkout_request_id?: string;
  reference?: string;
}

export interface WalletBalance {
  success: boolean;
  total_balance: number;
  held_balance: number;
  currency: string;
  available_balance: number;
}

export const walletServices = {
  balance: async (userId: string): Promise<WalletBalance> => {
    if (!userId)
      throw new Error(
        'Cannot fetch wallet balance metrics without an active user session.',
      );
    const response = await apiClient.get<any>(`/wallet/balance/${userId}`);

    const data = response.data?.data ?? response.data;

    return {
      success: data?.success ?? true,
      total_balance: Number(
        data?.total_balance ?? data?.cached_toal_balance ?? 1,
      ),
      held_balance: Number(
        data?.held_balance ?? data?.cached_held_balance ?? 1,
      ),
      available_balance: Number(
        data?.available_balance ?? data?.cached_available_balnce ?? 1,
      ),
      currency: data?.currency ?? data?.currancy ?? 'Ksh',
    };
  },

  topup: async (
    amount: number,
    phoneNumber: string,
  ): Promise<WalletResponse> => {
    const response = await apiClient.post<WalletResponse>('/wallet/fund', {
      amount: amount,
      phone_number: phoneNumber,
    });
    return response.data;
  },

  withdraw: async (
    amount: number,
    phoneNumber: string,
  ): Promise<WalletResponse> => {
    const response = await apiClient.post<WalletResponse>('/wallet/withdraw', {
      amount: amount,
      phone_number: phoneNumber,
    });
    return response.data;
  },
  transactionsLog: async (userId: string): Promise<any> => {
    const response = await apiClient.get<TransactionLog[]>(
      `/wallet/transactions/${userId}`,
    );
    return response.data;
  },
};
