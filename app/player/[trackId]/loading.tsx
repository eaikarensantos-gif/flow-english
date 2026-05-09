export default function PlayerLoading() {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] animate-pulse">
      <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-white/5">
        <div className="aspect-square bg-bg-elevated" />
        <div className="p-4 space-y-3">
          <div className="h-6 w-48 bg-bg-elevated rounded" />
          <div className="h-4 w-32 bg-bg-elevated rounded" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-8 bg-bg-elevated rounded-xl" style={{ width: `${60 + Math.random() * 40}%` }} />
        ))}
      </div>
    </div>
  );
}
