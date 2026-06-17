import React from 'react';

export const WalletSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 antialiased animate-pulse">
      {/* 1. Sync Monitoring Badge Mimic Placeholder */}
      <div className="flex justify-end select-none">
        <div className="h-6 w-28 bg-surface-container-low border border-outline-variant/30 rounded-full" />
      </div>

      {/* 2. Standalone WalletStats Component Box Mimic */}
      <div className="bg-surface-container-highest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        {/* Main Matrix Stat Panels */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-2">
          {/* Available Cash Panel */}
          <div className="flex-1 min-w-[200px] flex items-center gap-3">
            <div className="w-11 h-11 bg-outline-variant/40 rounded-xl shrink-0" />
            <div className="w-full space-y-2">
              <div className="h-3 bg-outline-variant/30 rounded w-20" />
              <div className="h-6 bg-outline-variant/50 rounded w-32" />
            </div>
          </div>

          <div className="hidden lg:block w-[1px] bg-outline-variant/30 self-stretch my-1" />

          {/* Held / Escrow Panel */}
          <div className="flex-1 min-w-[200px] flex items-center gap-3 lg:pl-4">
            <div className="w-11 h-11 bg-outline-variant/40 rounded-xl shrink-0" />
            <div className="w-full space-y-2">
              <div className="h-3 bg-outline-variant/30 rounded w-24" />
              <div className="h-6 bg-outline-variant/40 rounded w-28" />
            </div>
          </div>

          <div className="hidden lg:block w-[1px] bg-outline-variant/30 self-stretch my-1" />

          {/* Total Assets Panel */}
          <div className="flex-1 min-w-[200px] flex items-center gap-3 lg:pl-4">
            <div className="w-11 h-11 bg-outline-variant/40 rounded-xl shrink-0" />
            <div className="w-full space-y-2">
              <div className="h-3 bg-outline-variant/30 rounded w-28" />
              <div className="h-6 bg-outline-variant/50 rounded w-36" />
            </div>
          </div>
        </div>

        {/* Compact Balance Action Footer Control Mimic */}
        <div className="px-4 py-3 bg-surface-container-low border-t border-outline-variant flex justify-end gap-2">
          {/* Mock Withdraw Button */}
          <div className="h-8 bg-outline-variant/40 rounded-xl w-24 shrink-0" />
          {/* Mock Topup Button */}
          <div className="h-8 bg-outline-variant/60 rounded-xl w-24 shrink-0" />
        </div>
      </div>

      {/* 3. Standalone TransactionLedger Card Component Box Mimic */}
      <div className="bg-surface-container-highest border border-outline-variant rounded-2xl shadow-sm p-4 sm:p-5 space-y-6">
        {/* Mock Ledger Component Header */}
        <div className="h-4 bg-outline-variant/40 rounded w-1/4 mb-2" />
        
        {/* Mock Historical Transaction Ledger Records Lines */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={index} 
              className="w-full flex justify-between items-center py-1 border-b border-outline-variant/20 last:border-0 pb-4 last:pb-0"
            >
              <div className="space-y-2 w-2/3">
                {/* Mock description text details lines */}
                <div className="h-3 bg-outline-variant/40 rounded w-full md:w-3/4" />
                {/* Mock timestamp tracking info log line */}
                <div className="h-2.5 bg-outline-variant/20 rounded w-1/2" />
              </div>
              {/* Mock tracking amount tag ledger info box */}
              <div className="h-4 bg-outline-variant/50 rounded w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};