"use client";

import { useRef, useState } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import VocabCard from "@/components/player/VocabCard";
import type { LyricsLine, WordEnrichment } from "@/types";

interface WordTapModeProps {
  lines: LyricsLine[];
  enrichments: WordEnrichment[];
  activeIndex: number;
  onSeek: (ms: number) => void;
  songTitle: string;
}

export default function WordTapMode({ lines, enrichments, activeIndex, onSeek, songTitle }: WordTapModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedWord, setSelectedWord] = useState<WordEnrichment | null>(null);
  useAutoScroll(activeIndex, containerRef);

  const enrichMap = new Map<string, WordEnrichment>();
  enrichments.forEach((e) => enrichMap.set(e.word.toLowerCase(), e));

  function renderLine(line: LyricsLine, lineIndex: number) {
    const isActive = lineIndex === activeIndex;
    const words = line.text.split(/(\s+)/);

    return (
      <div
        key={line.id}
        data-line-index={lineIndex}
        onClick={() => line.startMs != null && onSeek(line.startMs)}
        className={`px-4 py-2 rounded-xl text-sm leading-relaxed cursor-pointer flex flex-wrap gap-x-0.5 transition-all ${
          isActive ? "bg-bg-elevated ring-1 ring-accent/20" : "hover:bg-bg-elevated/30"
        }`}
      >
        {words.map((segment, si) => {
          if (/^\s+$/.test(segment)) return <span key={si}>{segment}</span>;

          const clean = segment.toLowerCase().replace(/[^a-z0-9']/g, "");
          const enrichment = enrichMap.get(clean);

          if (enrichment) {
            return (
              <button
                key={si}
                onClick={(e) => { e.stopPropagation(); setSelectedWord(enrichment); }}
                className={`underline decoration-accent/50 underline-offset-2 text-accent hover:text-accent-hover transition-colors ${
                  isActive ? "" : "text-accent/60"
                }`}
              >
                {segment}
              </button>
            );
          }

          return (
            <span key={si} className={isActive ? "text-white" : "text-white/35"}>
              {segment}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-280px)] space-y-1 scrollbar-hide">
        {lines.map((line, i) => renderLine(line, i))}
      </div>

      {selectedWord && (
        <VocabCard
          word={selectedWord}
          songTitle={songTitle}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </>
  );
}
