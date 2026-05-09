import type { VocabWord } from "@/types";

const KEY = "flow-english-vocab";

export function getVocab(): VocabWord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveWord(word: VocabWord): void {
  const vocab = getVocab();
  const exists = vocab.findIndex((w) => w.word.toLowerCase() === word.word.toLowerCase());
  if (exists >= 0) {
    vocab[exists] = word;
  } else {
    vocab.push(word);
  }
  localStorage.setItem(KEY, JSON.stringify(vocab));
}

export function removeWord(word: string): void {
  const vocab = getVocab().filter((w) => w.word.toLowerCase() !== word.toLowerCase());
  localStorage.setItem(KEY, JSON.stringify(vocab));
}

export function clearVocab(): void {
  localStorage.removeItem(KEY);
}

export function isWordSaved(word: string): boolean {
  return getVocab().some((w) => w.word.toLowerCase() === word.toLowerCase());
}
