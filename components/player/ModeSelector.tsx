"use client";

import type { PlaybackMode } from "@/types";

const MODES: { value: PlaybackMode; label: string }[] = [
  { value: "sync", label: "Sync" },
  { value: "translate", label: "Translate" },
  { value: "fill", label: "Fill in the Blank" },
  { value: "wordtap", label: "Word Tap" },
];

interface ModeSelectorProps {
  mode: PlaybackMode;
  onChange: (mode: PlaybackMode) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-1 py-1 bg-bg-elevated rounded-full">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
            mode === m.value
              ? "bg-accent text-bg"
              : "text-white/50 hover:text-white"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
