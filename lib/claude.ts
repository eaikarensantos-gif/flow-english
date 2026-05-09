import Anthropic from "@anthropic-ai/sdk";
import type { EnrichedLine, Question } from "@/types";
import { hipHopDictionary } from "./hipHopDictionary";

const client = new Anthropic();

const ENRICH_SYSTEM = `You are an English teaching assistant specializing in hip-hop lyrics for Brazilian Portuguese speakers.
For each line provided, return a JSON array where each element has:
- "line": the original English text
- "translation": Brazilian Portuguese natural translation (not literal)
- "culturalNote": 1-2 sentence explanation of cultural reference or slang origin (null if none)
- "words": array of 2-3 key vocabulary words, each with { "word", "definition" (in English), "partOfSpeech", "example" (usage sentence), "difficulty": "easy"|"medium"|"hard" }
Return ONLY valid JSON array. No markdown, no code blocks.`;

const QUIZ_SYSTEM = `You are an English teaching assistant creating quiz questions from hip-hop lyrics for Brazilian Portuguese learners.
Generate exactly 10 quiz questions based on the provided lyrics data.
Return a JSON array of questions, each with:
- "type": "multiple_choice" | "fill_blank" | "cultural"
- "question": the question text
- "options": array of 4 strings (for multiple_choice only)
- "answer": the correct answer string
- "explanation": brief explanation in Portuguese or English
Include: 4 multiple_choice, 3 fill_blank, 3 cultural questions.
Return ONLY valid JSON array. No markdown.`;

async function callClaudeWithRetry(
  messages: Anthropic.MessageParam[],
  system: string,
  maxTokens = 4000,
  retries = 3
): Promise<string> {
  console.log("[claude] KEY present:", !!process.env.ANTHROPIC_API_KEY, "model: claude-opus-4-5");
  for (let i = 0; i < retries; i++) {
    try {
      const response = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: maxTokens,
        system,
        messages,
      });
      const block = response.content[0];
      if (block.type !== "text") throw new Error("Unexpected response type");
      return block.text;
    } catch (err: any) {
      if (i < retries - 1 && (err.status === 529 || err.status === 503)) {
        await new Promise((r) => setTimeout(r, 2 ** i * 1000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Claude API failed after retries");
}

function fallbackEnrich(lines: string[]): EnrichedLine[] {
  return lines.map((line) => {
    const words = line
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => hipHopDictionary[w]);

    return {
      line,
      translation: line,
      culturalNote: null,
      words: words.slice(0, 3).map((w) => ({
        word: w,
        definition: hipHopDictionary[w].definition,
        partOfSpeech: hipHopDictionary[w].partOfSpeech,
        example: hipHopDictionary[w].example,
        difficulty: hipHopDictionary[w].difficulty,
      })),
    };
  });
}

export async function enrichLines(lines: string[]): Promise<EnrichedLine[]> {
  const CHUNK = 20;
  const results: EnrichedLine[] = [];

  for (let i = 0; i < lines.length; i += CHUNK) {
    const chunk = lines.slice(i, i + CHUNK);
    try {
      const text = await callClaudeWithRetry(
        [{ role: "user", content: JSON.stringify({ lines: chunk }) }],
        ENRICH_SYSTEM,
        4000
      );
      const parsed = JSON.parse(text);
      results.push(...parsed);
    } catch (e: any) {
      console.error("[claude] enrichLines error:", e?.message ?? e);
      results.push(...fallbackEnrich(chunk));
    }
  }

  return results;
}

export async function generateQuiz(
  lines: string[],
  words: Array<{ word: string; definition: string; partOfSpeech: string }>
): Promise<Question[]> {
  const payload = { lines: lines.slice(0, 30), words: words.slice(0, 20) };
  try {
    const text = await callClaudeWithRetry(
      [{ role: "user", content: JSON.stringify(payload) }],
      QUIZ_SYSTEM,
      2000
    );
    return JSON.parse(text);
  } catch {
    return [];
  }
}
