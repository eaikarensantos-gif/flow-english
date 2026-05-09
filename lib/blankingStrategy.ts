const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "is", "was", "are", "were", "be", "been", "has", "have",
  "had", "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "can", "it", "its", "i", "my", "me", "we", "our", "you", "your", "he", "she",
  "they", "them", "their", "this", "that", "these", "those", "not", "no", "all",
]);

export interface BlankPosition {
  word: string;
  wordIndex: number;
}

export function selectWordsToBlank(
  line: string,
  enrichedWords: string[],
  count = 1
): BlankPosition[] {
  const words = line.split(/\s+/);
  const enrichedSet = new Set(enrichedWords.map((w) => w.toLowerCase()));
  const candidates: BlankPosition[] = [];

  words.forEach((raw, wordIndex) => {
    const clean = raw.toLowerCase().replace(/[^a-z0-9']/g, "");
    if (!clean || STOPWORDS.has(clean)) return;

    // Priority: enriched words first, then words longer than 4 chars
    if (enrichedSet.has(clean) || clean.length > 4) {
      candidates.push({ word: raw, wordIndex });
    }
  });

  // Shuffle candidates and pick `count`
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function normalizeAnswer(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9']/g, "").trim();
}
