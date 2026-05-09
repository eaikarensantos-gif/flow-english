"use client";

import { useState } from "react";
import { normalizeAnswer } from "@/lib/blankingStrategy";
import type { Question } from "@/types";

interface Props {
  question: Question;
  onAnswer: (correct: boolean) => void;
}

export default function FillBlankCard({ question, onAnswer }: Props) {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);

  function submit() {
    if (revealed) return;
    const isCorrect = normalizeAnswer(value) === normalizeAnswer(question.answer);
    setCorrect(isCorrect);
    setRevealed(true);
    onAnswer(isCorrect);
  }

  return (
    <div className="space-y-4">
      <p className="text-white text-lg font-medium leading-snug">{question.question}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !revealed && submit()}
          disabled={revealed}
          placeholder="Type your answer..."
          className={`flex-1 bg-bg-elevated border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
            revealed
              ? correct
                ? "border-green-500/50 text-green-300"
                : "border-red-500/50 text-red-300"
              : "border-white/10 text-white focus:border-accent/50"
          }`}
        />
        {!revealed && (
          <button
            onClick={submit}
            className="bg-accent text-bg px-4 rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Check
          </button>
        )}
      </div>
      {revealed && (
        <div className="space-y-2">
          {!correct && (
            <p className="text-green-400 text-sm">Correct answer: <span className="font-bold">{question.answer}</span></p>
          )}
          <div className="bg-bg-elevated rounded-xl px-4 py-3 text-sm text-white/50">
            {question.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
