import { Suspense } from "react";
import Link from "next/link";
import { getSongs } from "@/lib/db";
import SongGrid from "@/components/SongGrid";
import FilterBar from "@/components/FilterBar";

interface PageProps {
  searchParams: Promise<{ level?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const level = params.level;

  const songs = await getSongs(level);

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Learn English through{" "}
          <span className="text-accent">Hip-Hop</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl">
          Upload any song, follow synchronized lyrics, and master vocabulary the way the greats speak it.
        </p>
        <div className="mt-6">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-accent text-bg font-semibold px-6 py-3 rounded-xl hover:bg-accent-hover transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload a Song
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-white/60 text-sm font-medium uppercase tracking-wider">
          Song Library
        </h2>
        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>
      </div>

      {/* Grid */}
      <SongGrid songs={songs as any} />
    </div>
  );
}
