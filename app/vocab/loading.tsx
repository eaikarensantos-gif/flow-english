export default function VocabLoading() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto animate-pulse">
      <div className="h-8 w-40 bg-bg-card rounded mb-2" />
      <div className="h-4 w-24 bg-bg-card rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-44 bg-bg-card rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
