function LedgerSkeleton() {
  return (
    <div className="w-full bg-surface-container rounded-xl p-5 space-y-4 animate-pulse border border-border/40">
      <div className="h-5 bg-muted/60 rounded w-1/3" />
      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-border/10 last:border-0">
            <div className="space-y-2 w-1/2">
              <div className="h-4 bg-muted/40 rounded w-3/4" />
              <div className="h-3 bg-muted/20 rounded w-1/2" />
            </div>
            <div className="h-4 bg-muted/40 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LedgerSkeleton;