"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-white/40 text-sm mb-8 max-w-sm">{error.message || "An unexpected error occurred."}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-accent text-bg px-6 py-3 rounded-xl font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="bg-bg-elevated text-white px-6 py-3 rounded-xl font-semibold text-sm border border-white/10 hover:bg-bg-card transition-colors">
          Go home
        </Link>
      </div>
    </div>
  );
}
