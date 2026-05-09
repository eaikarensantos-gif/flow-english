"use client";

import { useState } from "react";
import type { Question } from "@/types";

interface Props {
  question: Question;
  onAnswer: (correct: boolean) => void;
}

export default function MultipleChoiceCard({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(option: string) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    const correct = option === question.answer;
    onAnswer(correct);
  }

  return (
    <div className="space-y-4">
      <p className="text-white text-lg font-medium leading-snug">{question.question}</p>
      <div className="grid gap-3">
        {(question.options ?? []).map((option) => {
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
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="bg-bg-elevated rounded-xl px-4 py-3 text-sm text-white/50 mt-2">
          {question.explanation}
        </div>
      )}
    </div>
  );
}
