import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { TransactionLog, walletServices } from '@/services/walletServices';
import { WalletStats } from '@/components/wallet/WalletStats';
import {
  TransactionLedger,
} from '@/components/wallet/TransactionLedger';
import { MpesaModal } from '@/components/wallet/MpesaModal';
import { WalletSkeleton } from '@/components/UI/skeleton/WalletSkeleton';

const DUMMY_HISTORY: TransactionLog[] = [
  {
    id: '1',
    reference: 'NLK83JD72S',
    type: 'deposit',
    amount: 1500,
    date: '2026-06-11 14:22',
    status: 'completed',
    description: 'M-Pesa Deposit',
  },
  {
    id: '2',
    reference: 'NLM29DH83K',
    type: 'transfer',
    amount: -1250,
    date: '2026-06-11 11:05',
    status: 'pending',
    description: 'Held for Order #4412',
  },
  {
    id: '3',
    reference: 'NLM29DH829',
    type: 'payment',
    amount: -420,
    date: '2026-06-10 09:15',
    status: 'completed',
    description: 'Delivery Rider Fee',
  },
  {
    id: '4',
    reference: 'NLN45GG21P',
    type: 'withdrawal',
    amount: -500,
    date: '2026-06-08 10:12',
    status: 'completed',
    description: 'M-Pesa B2C Payout',
  },
];

export default function WalletPage() {
  const [modalMode, setModalMode] = useState<'topup' | 'withdraw' | null>(null);
  const { user } = useAuthStore();

  const { data: serverBalance, isLoading } = useQuery({
    queryKey: ['wallet-balance', user?.id],
    queryFn: () => walletServices.balance(user!.id),
    enabled: !!user?.id,
  });

  const { data: transactions_logs, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: () => walletServices.transactionsLog(user!.id),
    enabled: !!user?.id,
  });


  // Structural skeleton loader layer while network operations handle sync requests
  if (isLoading ) {
    return <WalletSkeleton />;
  }

  // Pure decoupled variables: Clean, normalized data mapped directly from the service layer
  const total_asset = serverBalance?.total_balance ?? 0;
  const heldBalance = serverBalance?.held_balance ?? 0;
  const availableBalance = serverBalance?.available_balance ?? 0;
  const currency = serverBalance?.currency || 'Ksh';

  return (
    <section className="min-h-screen bg-surface p-4 md:p-6 font-sans antialiased">
      <div className="max-w-3xl mx-auto space-y-6">
        <WalletStats
          available={availableBalance}
          held={heldBalance}
          currency={currency}
          onAction={(mode) => setModalMode(mode)}
        />

        <TransactionLedger history={DUMMY_HISTORY} />

        {modalMode && (
          <MpesaModal
            mode={modalMode}
            availableBalance={availableBalance}
            onClose={() => setModalMode(null)}
          />
        )}
      </div>
    </section>
  );
}
