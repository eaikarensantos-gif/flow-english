"use client";

import Link from "next/link";

interface Props {
  score: number;
  total: number;
  bestStreak: number;
  trackId: string;
  onRetry: () => void;
}

function getGrade(score: number, total: number) {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.9) return { label: "Hip-Hop Scholar", emoji: "🎓" };
  if (pct >= 0.7) return { label: "Flow Student", emoji: "🎤" };
  return { label: "Rookie Listener", emoji: "🎵" };
}

export default function ResultsScreen({ score, total, bestStreak, trackId, onRetry }: Props) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = getGrade(score, total);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="text-6xl mb-4">{grade.emoji}</div>
      <h2 className="text-3xl font-bold text-white mb-1">{grade.label}</h2>
      <p className="text-white/50 mb-8 text-sm">Quiz complete</p>

      <div className="flex gap-8 mb-8">
        <div>
          <p className="text-4xl font-bold text-accent">{score}<span className="text-2xl text-white/40">/{total}</span></p>
          <p className="text-xs text-white/40 mt-1">Correct</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-white">{pct}%</p>
          <p className="text-xs text-white/40 mt-1">Score</p>
        </div>
        {bestStreak > 0 && (
          <div>
            <p className="text-4xl font-bold text-white">{bestStreak}</p>
            <p className="text-xs text-white/40 mt-1">Best streak</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="flex-1 bg-accent text-bg font-semibold py-3 rounded-xl hover:bg-accent-hover transition-colors"
        >
          Try Again
        </button>
        <Link
          href={`/player/${trackId}`}
          className="flex-1 bg-bg-elevated text-white font-semibold py-3 rounded-xl hover:bg-bg-card border border-white/10 transition-colors"
        >
          Back to Song
        </Link>
      </div>
    </div>
  );
}
