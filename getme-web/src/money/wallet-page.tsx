import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { walletServices } from '@/services/walletServices';
import { WalletStats } from '@/components/wallet/WalletStats';
import { TransactionLedger } from '@/components/wallet/TransactionLedger';
import { MpesaModal } from '@/components/wallet/MpesaModal';
import { WalletSkeleton } from '@/components/UI/skeleton/WalletSkeleton';
import { useConnectionStatus, useEcho } from '@laravel/echo-react';
import { useToastStore } from '@/stores/useToastStore';
import LedgerSkeleton from '@/components/UI/skeleton/LedgerSkeleton';

export default function WalletPage() {
  const [modalMode, setModalMode] = useState<'topup' | 'withdraw' | null>(null);
  const { user } = useAuthStore();
  const connectionStatus = useConnectionStatus();
  const queryClient = useQueryClient();
  const toast = useToastStore((state) => state.toast);

  const { data: serverBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['wallet-balance', user?.id],
    queryFn: () => walletServices.balance(user!.id),
    enabled: !!user?.id,
  });

  const { data:transactions_logs , isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: () => walletServices.transactionsLog(user!.id),
    enabled: !!user?.id,
  });

  useEcho(
    user?.id ? `mpesa.transaction.status.changed.user.${user.id}` : '',
    '.mpesaTransactionUpdated',
    (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance', user?.id] });

      toast({
        message: data.message,
        variant: data.success ? 'info' : 'error',
        position: data.success ? 'bottom-right' : 'top-center',
        duration: 5000,
      });
    },
    [user?.id],
    'private',
  );

  if (isLoadingBalance) {
    return <WalletSkeleton />;
  }

  const availableBalance = serverBalance?.available_balance ?? 0;
  const heldBalance = serverBalance?.held_balance ?? 0;
  const currency = serverBalance?.currency || 'Ksh';
  const hasHistory = transactions_logs?.transactions && transactions_logs.transactions.length > 0;

  return (
    <section className="min-h-[100dvh] bg-surface p-4 md:p-6 font-sans antialiased text-on-surface">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Dynamic Websocket Engine Connection Status Tracker Badge */}
        <div className="flex justify-end text-[10px] tracking-wider uppercase font-bold text-on-surface-variant/70 select-none">
          <div className="flex items-center gap-1.5 bg-surface-container/60 px-2.5 py-1 rounded-full border border-border/10">
            <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            Live Sync: {connectionStatus}
          </div>
        </div>

        {/* Essential Core Balances Card View Component */}
        <WalletStats
          available={availableBalance}
          held={heldBalance}
          currency={currency}
          onAction={(mode) => setModalMode(mode)}
        />

        {isLoadingTransactions ? (
          <LedgerSkeleton />
        ) : hasHistory ? (
          <TransactionLedger history={transactions_logs.transactions} />
        ) : null} 

        {/* Transaction Actions Modal Gate */}
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