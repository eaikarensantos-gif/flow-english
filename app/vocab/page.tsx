"use client";

import { useState, useEffect } from "react";
import FlipCard from "@/components/vocab/FlipCard";
import EmptyVocabState from "@/components/vocab/EmptyVocabState";
import { getVocab } from "@/lib/vocabStore";
import type { VocabWord } from "@/types";

const FILTERS = [
  { value: "", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function VocabPage() {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWords(getVocab());
  }, []);

  function handleRemove(word: string) {
    setWords((prev) => prev.filter((w) => w.word !== word));
  }

  const filtered = words.filter((w) => {
    const matchDiff = !filter || w.difficulty === filter;
    const matchSearch = !search || w.word.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  if (!mounted) return null;

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Vocabulary</h1>
          <p className="text-white/40 text-sm mt-1">
            {words.length} {words.length === 1 ? "word" : "words"} saved
          </p>
        </div>
        {words.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-bg-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-accent/50 w-40"
            />
            <div className="flex items-center gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filter === f.value ? "bg-accent text-bg" : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {words.length === 0 ? (
        <EmptyVocabState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">No words match your filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((word) => (
            <FlipCard key={word.word} word={word} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
