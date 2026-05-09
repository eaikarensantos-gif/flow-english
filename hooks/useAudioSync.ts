"use client";

import type { LyricsLine } from "@/types";

export function useAudioSync(lines: LyricsLine[], currentTimeMs: number): number {
  if (!lines.length) return -1;

  // Binary search for the active line
  let lo = 0;
  let hi = lines.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const line = lines[mid];
    if (line.startMs == null || line.endMs == null) {
      lo = mid + 1;
      continue;
    }
    if (currentTimeMs >= line.startMs && currentTimeMs <= line.endMs) {
      return mid;
    }
    if (currentTimeMs < line.startMs) {
      hi = mid - 1;
    } else {
      result = mid;
      lo = mid + 1;
    }
  }

  return result;
}
