import React from 'react';
import { BiWallet, BiLockAlt, BiShieldQuarter, BiMinusCircle, BiPlusCircle } from 'react-icons/bi';

interface WalletStatsProps {
  available: number;
  held: number;
  currency?: string;
  onAction: (mode: 'topup' | 'withdraw') => void;
}

export const WalletStats: React.FC<WalletStatsProps> = ({ available, held, currency = 'Ksh', onAction }) => {
  const total = available + held;

  return (
    <div className="bg-surface-container-highest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
      
      {/* 1. Main Matrix Stat Layer: Using a wrapping flexbox instead of rigid 3-columns grid */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-2 lg:divide-x lg:divide-outline-variant">
        
        {/* Available Liquidity Card Segment */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <BiWallet className="text-xl" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant block truncate">Available Cash</span>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-on-surface truncate">
              {currency} {available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Escrow Lock Allocation Segment */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3 lg:pl-4">
          <div className="p-2.5 bg-tertiary/10 text-tertiary rounded-xl shrink-0">
            <BiLockAlt className="text-xl" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant block truncate">Held / In Escrow</span>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-on-surface-variant truncate">
              {currency} {held.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Combined Capital Portfolio Segment */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3 lg:pl-4">
          <div className="p-2.5 bg-surface-container-low border border-outline-variant text-on-surface rounded-xl shrink-0">
            <BiShieldQuarter className="text-xl" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant block truncate">Total Asset Cap</span>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-primary truncate">
              {currency} {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Compact Control Footer Module */}
      <div className="px-4 py-3 bg-surface-container-low border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-on-surface-variant text-center md:text-left leading-relaxed max-w-sm">
          Escrow assets clear securely and automatically processing ongoing delivery arrivals.
        </p>
        
        {/* Optimized Action Bar */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => onAction('withdraw')}
            className="flex-1 md:flex-none px-3.5 py-2 bg-surface-container-highest border border-outline-variant text-on-surface hover:bg-surface-variant/40 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all"
          >
            <BiMinusCircle className="text-base text-error" /> Withdraw
          </button>
          <button
            onClick={() => onAction('topup')}
            className="flex-1 md:flex-none px-3.5 py-2 bg-primary text-on-primary hover:bg-primary/90 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-xs transition-all shrink-0"
          >
            <BiPlusCircle className="text-base" /> Topup
          </button>
        </div>
      </div>
    </div>
  );
};