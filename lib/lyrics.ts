export interface TimedWord {
  text: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface AlignedLine {
  text: string;
  startMs: number | null;
  endMs: number | null;
  lineIndex: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  let overlap = 0;
  ta.forEach((t) => { if (tb.has(t)) overlap++; });
  return ta.size + tb.size === 0 ? 0 : (2 * overlap) / (ta.size + tb.size);
}

export function groupWordsIntoLines(words: TimedWord[]): AlignedLine[] {
  if (!words.length) return [];

  const lines: AlignedLine[] = [];
  let currentWords: TimedWord[] = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap > 800) {
      lines.push({
        text: currentWords.map((w) => w.text).join(" "),
        startMs: currentWords[0].start,
        endMs: currentWords[currentWords.length - 1].end,
        lineIndex: lines.length,
      });
      currentWords = [];
    }
    currentWords.push(words[i]);
  }

  if (currentWords.length) {
    lines.push({
      text: currentWords.map((w) => w.text).join(" "),
      startMs: currentWords[0].start,
      endMs: currentWords[currentWords.length - 1].end,
      lineIndex: lines.length,
    });
  }

  return lines;
}

export function alignLyricsToTimestamps(
  geniusLines: string[],
  assemblyWords: TimedWord[]
): AlignedLine[] {
  if (!assemblyWords.length) {
    return geniusLines.map((text, lineIndex) => ({ text, startMs: null, endMs: null, lineIndex }));
  }

  // Build timed segments by grouping AssemblyAI words into chunks
  const timedLines = groupWordsIntoLines(assemblyWords);

  if (!timedLines.length) {
    return geniusLines.map((text, lineIndex) => ({ text, startMs: null, endMs: null, lineIndex }));
  }

  // Match each Genius line to its best-matching timed segment
  const matched = new Set<number>();
  const result: AlignedLine[] = geniusLines.map((geniusLine, lineIndex) => {
    let bestIdx = -1;
    let bestScore = -1;

    timedLines.forEach((tl, i) => {
      if (matched.has(i)) return;
      const score = tokenOverlap(geniusLine, tl.text);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    });

    if (bestIdx >= 0 && bestScore > 0.2) {
      matched.add(bestIdx);
      return {
        text: geniusLine,
        startMs: timedLines[bestIdx].startMs,
        endMs: timedLines[bestIdx].endMs,
        lineIndex,
      };
    }

    // Fallback: distribute evenly
    const ratio = lineIndex / geniusLines.length;
    const approxIdx = Math.floor(ratio * timedLines.length);
    const tl = timedLines[Math.min(approxIdx, timedLines.length - 1)];
    return {
      text: geniusLine,
      startMs: tl.startMs,
      endMs: tl.endMs,
      lineIndex,
    };
  });

  return result;
}
