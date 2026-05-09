"use client";

import { useState } from "react";
import type { Question } from "@/types";

interface Props {
  question: Question;
  onAnswer: (correct: boolean) => void;
}

export default function CulturalCard({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const options = question.options ?? ["True", "False"];

  function handleSelect(option: string) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    onAnswer(option === question.answer);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full font-medium">Cultural Note</span>
      </div>
      <p className="text-white text-lg font-medium leading-snug">{question.question}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          let style = "bg-bg-elevated border border-white/10 text-white/80 hover:border-white/30";
          if (revealed) {
            if (option === question.answer) style = "bg-green-500/20 border border-green-500/50 text-green-300";
            else if (option === selected) style = "bg-red-500/20 border border-red-500/50 text-red-300";
            else style = "bg-bg-elevated border border-white/5 text-white/30";
          }
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="bg-bg-elevated rounded-xl px-4 py-3 text-sm text-white/50">
          {question.explanation}
        </div>
      )}
    </div>
  );
}
