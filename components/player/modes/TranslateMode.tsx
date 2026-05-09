"use client";

import { useRef, useState } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import type { LyricsLine } from "@/types";

interface TranslateModeProps {
  lines: LyricsLine[];
  activeIndex: number;
  onSeek: (ms: number) => void;
}

export default function TranslateMode({ lines, activeIndex, onSeek }: TranslateModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipLine, setTooltipLine] = useState<number | null>(null);
  useAutoScroll(activeIndex, containerRef);

  return (
    <div ref={containerRef} className="overflow-y-auto max-h-[60vh] md:max-h-[calc(100vh-280px)] scrollbar-hide">
      {lines.map((line, i) => (
        <button
          key={line.id}
          data-line-index={i}
          onClick={() => line.startMs != null && onSeek(line.startMs)}
          className={`w-full text-left grid grid-cols-2 gap-4 px-4 py-3 rounded-xl border-b border-white/5 transition-all ${
            i === activeIndex ? "bg-bg-elevated ring-1 ring-accent/20" : "hover:bg-bg-elevated/50"
          }`}
        >
          <span className={`text-sm ${i === activeIndex ? "text-white font-medium" : "text-white/60"}`}>
            {line.text}
          </span>
          <div className="flex items-start gap-2">
            <span className={`text-sm ${i === activeIndex ? "text-accent font-medium" : "text-white/40"}`}>
              {line.translation ?? <span className="italic text-white/20">Not translated yet</span>}
            </span>
            {line.culturalNote && (
              <div className="relative shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setTooltipLine(tooltipLine === i ? null : i); }}
                  className="h-4 w-4 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center hover:bg-accent/40 mt-0.5"
                >
                  ?
                </button>
                {tooltipLine === i && (
                  <div className="absolute right-0 top-6 z-10 w-56 bg-bg-elevated border border-white/10 rounded-xl p-3 text-left shadow-xl">
                    <p className="text-white/70 text-xs leading-relaxed">{line.culturalNote}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
