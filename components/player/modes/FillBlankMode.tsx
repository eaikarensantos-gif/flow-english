"use client";

import { useState, useRef, useMemo } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { selectWordsToBlank, normalizeAnswer } from "@/lib/blankingStrategy";
import type { LyricsLine, WordEnrichment } from "@/types";

interface FillBlankModeProps {
  lines: LyricsLine[];
  enrichments: WordEnrichment[];
  activeIndex: number;
  onSeek: (ms: number) => void;
}

interface BlankState {
  value: string;
  attempts: number;
  correct: boolean | null;
  revealed: boolean;
}

type LineBlank = { word: string; wordIndex: number; lineIndex: number };

export default function FillBlankMode({ lines, enrichments, activeIndex, onSeek }: FillBlankModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useAutoScroll(activeIndex, containerRef);

  const enrichedWords = useMemo(() => enrichments.map((e) => e.word), [enrichments]);

  const lineTargets = useMemo<LineBlank[]>(() =>
    lines.map((line, i) => {
      const blanks = selectWordsToBlank(line.text, enrichedWords);
      return blanks[0] ? { ...blanks[0], lineIndex: i } : { word: "", wordIndex: -1, lineIndex: i };
    }),
  [lines, enrichedWords]);

  const [blanks, setBlanks] = useState<BlankState[]>(() =>
    lines.map(() => ({ value: "", attempts: 0, correct: null, revealed: false }))
  );
  const [score, setScore] = useState({ correct: 0, total: 0 });

  function check(lineIndex: number) {
    const target = lineTargets[lineIndex];
    if (!target.word) return;
    const answer = normalizeAnswer(blanks[lineIndex].value);
    const expected = normalizeAnswer(target.word);
    const correct = answer === expected;

    setBlanks((prev) => {
      const next = [...prev];
      const old = next[lineIndex];
      const newAttempts = old.attempts + 1;
      const reveal = !correct && newAttempts >= 2;
      next[lineIndex] = { ...old, attempts: newAttempts, correct: correct ? true : null, revealed: reveal };
      return next;
    });

    if (correct) {
      setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    } else if (blanks[lineIndex].attempts + 1 >= 2) {
      setScore((s) => ({ ...s, total: s.total + 1 }));
    }
  }

  function reset() {
    setBlanks(lines.map(() => ({ value: "", attempts: 0, correct: null, revealed: false })));
    setScore({ correct: 0, total: 0 });
  }

  const answered = score.total;

  return (
    <div className="flex flex-col gap-2">
      {/* Score bar */}
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-white/40 text-xs">
          {answered > 0 ? `${score.correct}/${answered} correct` : "Fill in the highlighted words"}
        </span>
        <button onClick={reset} className="text-xs text-white/30 hover:text-white underline">
          Reset
        </button>
      </div>

      <div ref={containerRef} className="overflow-y-auto max-h-[55vh] md:max-h-[calc(100vh-300px)] space-y-1 scrollbar-hide">
        {lines.map((line, i) => {
          const target = lineTargets[i];
          const blank = blanks[i];
          if (!target.word) {
            return (
              <div key={line.id} data-line-index={i} className={`px-4 py-2 rounded-xl text-sm ${i === activeIndex ? "bg-bg-elevated text-white" : "text-white/30"}`}>
                {line.text}
              </div>
            );
          }

          const words = line.text.split(/\s+/);
          return (
            <div
              key={line.id}
              data-line-index={i}
              className={`px-4 py-2 rounded-xl text-sm flex flex-wrap items-center gap-1 ${i === activeIndex ? "bg-bg-elevated ring-1 ring-accent/20" : ""}`}
            >
              {words.map((w, wi) => {
                if (wi !== target.wordIndex) {
                  return (
                    <span key={wi} className={i === activeIndex ? "text-white" : "text-white/40"}>
                      {w}
                    </span>
                  );
                }

                if (blank.correct) {
                  return <span key={wi} className="font-bold text-green-400">{target.word}</span>;
                }
                if (blank.revealed) {
                  return <span key={wi} className="font-bold text-red-400 line-through mr-1">{target.word}</span>;
                }

                return (
                  <span key={wi} className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={blank.value}
                      onChange={(e) => setBlanks((prev) => {
                        const next = [...prev];
                        next[i] = { ...next[i], value: e.target.value };
                        return next;
                      })}
                      onKeyDown={(e) => e.key === "Enter" && check(i)}
                      className={`border-b-2 bg-transparent text-center text-sm outline-none w-20 transition-colors ${
                        blank.correct === null
                          ? "border-accent text-white"
                          : blank.correct
                            ? "border-green-500 text-green-400"
                            : "border-red-500 text-red-400"
                      }`}
                      style={{ width: `${Math.max(6, target.word.length * 0.7)}rem` }}
                    />
                    <button
                      onClick={() => check(i)}
                      className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded hover:bg-accent/20"
                    >
                      ✓
                    </button>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
