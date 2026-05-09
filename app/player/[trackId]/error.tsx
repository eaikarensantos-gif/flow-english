"use client";

import Link from "next/link";

export default function PlayerError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-white text-xl font-bold mb-2">Could not load this track</p>
      <p className="text-white/40 text-sm mb-8">The song may not exist or failed to load.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="bg-accent text-bg px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover">
          Retry
        </button>
        <Link href="/" className="bg-bg-elevated text-white px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-bg-card">
          Back to Library
        </Link>
      </div>
    </div>
  );
}
