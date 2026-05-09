"use client";

import { useState, useEffect } from "react";
import MultipleChoiceCard from "./MultipleChoiceCard";
import FillBlankCard from "./FillBlankCard";
import CulturalCard from "./CulturalCard";
import ResultsScreen from "./ResultsScreen";
import Spinner from "@/components/ui/Spinner";
import ProgressBar from "@/components/ui/ProgressBar";
import { useStreak } from "@/hooks/useStreak";
import type { Question } from "@/types";

interface Props {
  trackId: string;
  songTitle: string;
}

type QuizState = "loading" | "question" | "results" | "error";

export default function QuizShell({ trackId, songTitle }: Props) {
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const { streak, bestStreak, recordCorrect, recordWrong } = useStreak();

  async function loadQuiz() {
    setQuizState("loading");
    setCurrentQ(0);
    setScore(0);
    try {
      // Fetch song lines and words for quiz generation
      const songRes = await fetch(`/api/songs/${trackId}`);
      const songData = await songRes.json();

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: songData.data?.lines ?? [],
          words: songData.data?.words ?? [],
        }),
      });
      const data = await res.json();
      if (data.ok && data.data?.questions?.length) {
        setQuestions(data.data.questions);
        setQuizState("question");
      } else {
        setQuizState("error");
      }
    } catch {
      setQuizState("error");
    }
  }

  useEffect(() => { loadQuiz(); }, [trackId]);

  function handleAnswer(correct: boolean) {
    if (correct) {
      setScore((s) => s + 1);
      recordCorrect();
    } else {
      recordWrong();
    }
    setAnswered(true);
  }

  function next() {
    if (currentQ + 1 >= questions.length) {
      setQuizState("results");
    } else {
      setCurrentQ((q) => q + 1);
      setAnswered(false);
    }
  }

  if (quizState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner size="lg" className="text-accent" />
        <p className="text-white/40 text-sm">Generating quiz with AI…</p>
      </div>
    );
  }

  if (quizState === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-white/50 mb-4">Could not generate quiz. Make sure the song has been processed.</p>
        <button onClick={loadQuiz} className="bg-accent text-bg px-6 py-2 rounded-xl text-sm font-medium hover:bg-accent-hover">
          Try Again
        </button>
      </div>
    );
  }

  if (quizState === "results") {
    return (
      <ResultsScreen
        score={score}
        total={questions.length}
        bestStreak={bestStreak}
        trackId={trackId}
        onRetry={() => loadQuiz()}
      />
    );
  }

  const question = questions[currentQ];

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{songTitle}</p>
          <p className="text-sm text-white/60">Question {currentQ + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <p className="text-accent font-bold text-lg">{score}</p>
          {streak >= 3 && <p className="text-xs text-orange-400">🔥 {streak} streak</p>}
        </div>
      </div>

      <ProgressBar value={((currentQ) / questions.length) * 100} className="mb-8" />

      <div className="bg-bg-card border border-white/5 rounded-2xl p-6 mb-4">
        {question.type === "multiple_choice" ? (
          <MultipleChoiceCard key={currentQ} question={question} onAnswer={handleAnswer} />
        ) : question.type === "fill_blank" ? (
          <FillBlankCard key={currentQ} question={question} onAnswer={handleAnswer} />
        ) : (
          <CulturalCard key={currentQ} question={question} onAnswer={handleAnswer} />
        )}
      </div>

      {answered && (
        <button
          onClick={next}
          className="w-full bg-accent text-bg font-semibold py-3 rounded-xl hover:bg-accent-hover transition-colors"
        >
          {currentQ + 1 >= questions.length ? "See Results" : "Next Question →"}
        </button>
      )}
    </div>
  );
}
