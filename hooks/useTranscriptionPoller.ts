"use client";

import { useState, useEffect, useRef } from "react";
import type { TimedWord } from "@/lib/lyrics";

interface PollResult {
  status: "idle" | "polling" | "completed" | "error" | "timeout";
  progress: number;
  words: TimedWord[];
  text: string;
  error: string | null;
}

export function useTranscriptionPoller(jobId: string | null) {
  const [result, setResult] = useState<PollResult>({
    status: "idle",
    progress: 0,
    words: [],
    text: "",
    error: null,
  });

  const pollCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!jobId) return;

    pollCount.current = 0;
    setResult({ status: "polling", progress: 5, words: [], text: "", error: null });

    intervalRef.current = setInterval(async () => {
      pollCount.current++;

      if (pollCount.current > 100) {
        clearInterval(intervalRef.current!);
        setResult((prev) => ({ ...prev, status: "timeout", error: "Transcription timed out after 5 minutes." }));
        return;
      }

      try {
        const res = await fetch(`/api/transcribe/${jobId}`);
        const json = await res.json();
        const data = json.data;

        if (data.status === "completed") {
          clearInterval(intervalRef.current!);
          setResult({ status: "completed", progress: 100, words: data.words, text: data.text, error: null });
        } else if (data.status === "error") {
          clearInterval(intervalRef.current!);
          setResult({ status: "error", progress: 0, words: [], text: "", error: data.error ?? "Transcription failed" });
        } else {
          // Estimate progress
          const progress = data.status === "queued"
            ? Math.min(15, pollCount.current * 2)
            : Math.min(90, 15 + pollCount.current * 1.5);
          setResult((prev) => ({ ...prev, progress }));
        }
      } catch {
        // Network hiccup — keep trying
      }
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId]);

  return result;
}
