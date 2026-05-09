"use client";

import { useEffect } from "react";
import Badge from "@/components/ui/Badge";
import type { WordEnrichment } from "@/types";
import { saveWord, isWordSaved } from "@/lib/vocabStore";
import { useState } from "react";

interface VocabCardProps {
  word: WordEnrichment;
  songTitle: string;
  onClose: () => void;
}

export default function VocabCard({ word, songTitle, onClose }: VocabCardProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isWordSaved(word.word));
  }, [word.word]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave() {
    saveWord({
      word: word.word,
      definition: word.definition,
      partOfSpeech: word.partOfSpeech,
      example: word.example,
      difficulty: word.difficulty,
      songTitle,
      savedAt: Date.now(),
    });
    setSaved(true);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 md:bg-transparent" onClick={onClose} />

      {/* Card — bottom sheet on mobile, floating on desktop */}
      <div className="fixed z-50 left-0 right-0 bottom-0 md:left-auto md:right-8 md:bottom-24 md:w-80 bg-bg-elevated border border-white/10 rounded-t-2xl md:rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-white">{word.word}</span>
            <span className="ml-2 text-white/40 text-sm">{word.partOfSpeech}</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-xl leading-none ml-2">×</button>
        </div>

        <Badge level={word.difficulty} className="mb-3" />

        <p className="text-white/80 text-sm mb-3">{word.definition}</p>
        <p className="text-white/40 text-xs italic mb-4">"{word.example}"</p>

        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
            saved
              ? "bg-green-500/20 text-green-400 cursor-default"
              : "bg-accent text-bg hover:bg-accent-hover"
          }`}
        >
          {saved ? "✓ Saved to vocabulary" : "Save to vocabulary"}
        </button>
      </div>
    </>
  );
}
