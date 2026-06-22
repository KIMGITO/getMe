const OrderHistorySkeleton = () => (
  <div className="space-y-3 animate-pulse p-4 ">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="p-4 bg-surface border border-outline-variant rounded-2xl flex justify-between items-center h-20"
      >
        {/* Left Side: Title & Meta placeholders */}
        <div className="space-y-2 w-1/2">
          <div className="h-4 bg-outline-variant rounded w-3/4"></div>
          <div className="h-3 bg-outline-variant rounded w-1/2"></div>
        </div>
        
        {/* Right Side: Action Button placeholders */}
        <div className="flex gap-2 p-2">
          <div className="w-8 h-8 rounded-xl bg-outline-variant"></div>
          <div className="w-8 h-8 rounded-xl bg-outline-variant"></div>
          
        </div>
      </div>
    ))}
  </div>
);

export default OrderHistorySkeleton;