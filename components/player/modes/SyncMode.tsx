"use client";

import { useRef } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import type { LyricsLine } from "@/types";

interface SyncModeProps {
  lines: LyricsLine[];
  activeIndex: number;
  onSeek: (ms: number) => void;
}

export default function SyncMode({ lines, activeIndex, onSeek }: SyncModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useAutoScroll(activeIndex, containerRef);

  return (
    <div ref={containerRef} className="overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-280px)] space-y-1 px-1 scrollbar-hide">
      {lines.map((line, i) => (
        <button
          key={line.id}
          data-line-index={i}
          onClick={() => line.startMs != null && onSeek(line.startMs)}
          className={`w-full text-left px-4 py-2 rounded-xl transition-all duration-150 ${
            i === activeIndex
              ? "bg-bg-elevated text-white font-semibold text-base ring-1 ring-accent/30"
              : "text-white/35 hover:text-white/70 text-sm"
          }`}
        >
          {line.text}
        </button>
      ))}
    </div>
  );
}
