export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  year?: number | null;
  level: string;
  coverUrl?: string | null;
  geniusUrl?: string | null;
  duration?: number | null;
  tags: string;
  lyrics?: string | null;
  createdAt: Date;
}

export interface LyricsLine {
  id: string;
  songId: string;
  lineIndex: number;
  text: string;
  startMs?: number | null;
  endMs?: number | null;
  translation?: string | null;
  culturalNote?: string | null;
}

export interface WordEnrichment {
  id: string;
  songId: string;
  word: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  difficulty: string;
  lineIndex: number;
}

export interface EnrichedLine {
  line: string;
  translation: string;
  culturalNote: string | null;
  words: VocabWord[];
}

export interface VocabWord {
  word: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  difficulty: string;
  songTitle?: string;
  savedAt?: number;
}

export interface Question {
  type: "multiple_choice" | "fill_blank" | "cultural";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export type PlaybackMode = "sync" | "translate" | "fill" | "wordtap";
