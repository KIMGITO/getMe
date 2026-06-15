import React from 'react';

export const WalletSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-container-highest mt-8 w-3xl  border border-outline-variant rounded-2xl shadow-sm overflow-hidden animate-pulse">
      {/* 1. Main Matrix Stat Layer Mimic */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-2">
        {/* Available Cash Skeleton */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          {/* Mock Icon Box */}
          <div className="w-11 h-11 bg-outline-variant/40 rounded-xl shrink-0" />
          <div className="w-full space-y-2">
            {/* Mock Label */}
            <div className="h-3 bg-outline-variant/30 rounded w-20" />
            {/* Mock Big Amount */}
            <div className="h-6 bg-outline-variant/50 rounded w-32" />
          </div>
        </div>

        {/* Separator lines for desktop panels */}
        <div className="hidden lg:block w-[1px] bg-outline-variant/30 self-stretch my-1" />

        {/* Held / In Escrow Skeleton */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3 lg:pl-4">
          <div className="w-11 h-11 bg-outline-variant/40 rounded-xl shrink-0" />
          <div className="w-full space-y-2">
            <div className="h-3 bg-outline-variant/30 rounded w-24" />
            <div className="h-6 bg-outline-variant/40 rounded w-28" />
          </div>
        </div>

        <div className="hidden lg:block w-[1px] bg-outline-variant/30 self-stretch my-1" />

        {/* Total Asset Cap Skeleton */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3 lg:pl-4">
          <div className="w-11 h-11 bg-outline-variant/40 rounded-xl shrink-0" />
          <div className="w-full space-y-2">
            <div className="h-3 bg-outline-variant/30 rounded w-28" />
            <div className="h-6 bg-outline-variant/50 rounded w-36" />
          </div>
        </div>
      </div>

      {/* 2. Compact Control Footer Mimic */}
      <div className="px-4 py-3 bg-surface-container-low border-t border-outline-variant flex flex-col   gap-3">
        {/* Mock Buttons Container */}
        <div className="flex justify-end gap-2 w-full md:w-auto shrink-0">
          {/* Mock Withdraw Button */}
          <div className="h-8 bg-outline-variant/40 rounded-xl flex-1 md:w-24 md:flex-none" />
          {/* Mock Topup Button */}
          <div className="h-8 bg-outline-variant/60 rounded-xl flex-1 md:w-24 md:flex-none" />
        </div>
        {/* Mock Description Lines */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="w-full md:w-2/3 space-y-1.5">
              <div className="h-2.5 bg-outline-variant/30 rounded w-full" />
              <div className="h-2.5 bg-outline-variant/30 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
