"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { removeWord } from "@/lib/vocabStore";
import type { VocabWord } from "@/types";

interface Props {
  word: VocabWord;
  onRemove: (word: string) => void;
}

export default function FlipCard({ word, onRemove }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative h-44 cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-bg-card border border-white/5 rounded-2xl p-4 flex flex-col"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-start justify-between mb-2">
            <Badge level={word.difficulty} />
            <button
              onClick={(e) => { e.stopPropagation(); removeWord(word.word); onRemove(word.word); }}
              className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none"
              aria-label="Remove word"
            >
              ×
            </button>
          </div>
          <p className="text-2xl font-bold text-white mt-auto">{word.word}</p>
          <p className="text-xs text-white/30 mt-1">{word.partOfSpeech}</p>
          {word.songTitle && (
            <p className="text-[10px] text-white/20 mt-2 truncate">From: {word.songTitle}</p>
          )}
          <p className="text-[10px] text-accent/40 mt-1 self-end">Tap to flip →</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-bg-elevated border border-accent/10 rounded-2xl p-4 flex flex-col"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-sm text-white/80 mb-2 flex-1">{word.definition}</p>
          <p className="text-xs text-white/40 italic">"{word.example}"</p>
        </div>
      </div>
    </div>
  );
}
