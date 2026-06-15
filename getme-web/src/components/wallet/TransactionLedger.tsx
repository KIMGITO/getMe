import { TransactionLog } from '@/services/walletServices';
import React from 'react';
import { BiHistory } from 'react-icons/bi';



interface TransactionLedgerProps {
  history?: TransactionLog[];
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({ history }) => {
  return (
    <div className="border border-outline-variant bg-surface-container-lowest rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-outline-variant pb-3 text-on-surface-variant">
        <BiHistory className="text-xl" />
        <h3 className="font-bold text-sm uppercase tracking-wider">Account Transaction History</h3>
      </div>

      <div className="divide-y divide-outline-variant">
        {history  && history.map((tx) => (
          <div key={tx.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide uppercase ${
                  tx.type === 'deposit' ? 'bg-success-container text-on-success-container' :
                  tx.type === 'transfer' ? 'bg-warning-container text-on-warning-container' :
                  tx.type === 'withdrawal' ? 'bg-error-container text-on-error-container' :
                  'bg-surface-variant text-on-surface-variant'
                }`}>
                  {tx.type === 'deposit' && 'M-Pesa Deposit'}
                  {tx.type === 'transfer' && 'Escrow Locked'}
                  {tx.type === 'payment' && 'Order Payment'}
                  {tx.type === 'withdrawal' && 'Cashout Outflow'}
                </span>
                <span className="font-mono text-xs text-on-surface-variant tracking-wider">{tx.reference}</span>
              </div>
              <p className="text-xs font-medium text-on-surface">{tx.description}</p>
              <p className="text-[11px] text-on-surface-variant">{tx.date}</p>
            </div>
            
            <div className="text-right">
              <span className={`text-base font-bold ${tx.amount > 0 ? 'text-green-600' : tx.type === 'transfer' ? 'text-on-surface-variant opacity-70' : 'text-on-surface'}`}>
                {tx.amount > 0 ? `+Ksh ${tx.amount.toLocaleString()}` : `-Ksh ${Math.abs(tx.amount).toLocaleString()}`}
              </span>
              <span className={`block text-[10px] font-bold ${tx.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};