"use client";

import { useState } from "react";

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  function recordCorrect() {
    setStreak((s) => {
      const next = s + 1;
      setBestStreak((b) => Math.max(b, next));
      return next;
    });
  }

  function recordWrong() {
    setStreak(0);
  }

  return { streak, bestStreak, recordCorrect, recordWrong };
}
