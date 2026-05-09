import Link from "next/link";

export default function EmptyVocabState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <svg className="h-10 w-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No words saved yet</h2>
      <p className="text-white/40 text-sm mb-6 max-w-xs">
        Tap on highlighted words while listening to save them to your vocabulary.
      </p>
      <Link
        href="/"
        className="bg-accent text-bg px-6 py-3 rounded-xl font-semibold text-sm hover:bg-accent-hover transition-colors"
      >
        Browse Library
      </Link>
    </div>
  );
}
