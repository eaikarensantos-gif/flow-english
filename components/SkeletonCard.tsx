export default function SkeletonCard() {
  return (
    <div className="bg-bg-card rounded-xl overflow-hidden border border-white/5 animate-pulse">
      <div className="aspect-square bg-bg-elevated" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-white/5 rounded w-3/4" />
          <div className="h-5 bg-white/5 rounded-full w-16" />
        </div>
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-8 bg-white/5 rounded-lg w-full mt-2" />
      </div>
    </div>
  );
}
