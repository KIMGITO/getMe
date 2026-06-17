export function RiderProfileSkeleton() {
  return (
    <div className="flex min-h-screen flex-col  h-full max-w-4xl w-full mx-auto bg-surface-container-lowest border border-outline-variant/40 elevation-5 my-4 rounded-2xl overflow-hidden font-sans antialiased animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-3">
          {/* Mock Chevron + Step Title */}
          <div className="p-2 bg-on-surface/5 rounded-full h-8 w-8" />
          <div className="h-5 w-56 bg-on-surface/10 rounded-lg" />
        </div>
        {/* Mock Clear Form Button */}
        <div className="h-7 w-24 bg-error/10 rounded-xl" />
      </div>

      {/* Form Content Body Skeleton */}
      <div className="flex-1 p-6 space-y-6">
        {/* Mock Full Width Input Field (National ID) */}
        <div className="space-y-2">
          <div className="h-3 w-28 bg-on-surface/10 rounded" />
          <div className="h-11 w-full bg-surface-container-low border border-outline-variant/50 rounded-xl" />
        </div>

        {/* Mock Grid: Image Dropzones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-48 bg-on-surface/10 rounded" />
            <div className="h-32 w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-48 bg-on-surface/10 rounded" />
            <div className="h-32 w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl" />
          </div>
        </div>

        {/* Mock Grid: Sacco Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <div className="h-3 w-44 bg-on-surface/10 rounded" />
            <div className="h-11 w-full bg-surface-container-low border border-outline-variant/50 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-36 bg-on-surface/10 rounded" />
            <div className="h-11 w-full bg-surface-container-low border border-outline-variant/50 rounded-xl" />
          </div>
        </div>

        {/* Mock Bottom Submission Button Block */}
        <div className="pt-4 border-t border-outline-variant/40">
          <div className="h-12 w-full bg-on-surface/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}