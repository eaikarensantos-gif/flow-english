import SkeletonCard from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="h-12 w-96 bg-bg-card rounded-xl animate-pulse mb-3" />
        <div className="h-4 w-64 bg-bg-card rounded animate-pulse" />
        <div className="h-12 w-40 bg-bg-card rounded-xl animate-pulse mt-6" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
