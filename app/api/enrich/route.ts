import { rateLimit } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";
import { enrichLines } from "@/lib/claude";
import { updateLyricsLine, upsertWordEnrichment } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    rateLimit(`enrich:${ip}`, 20, 60_000);

    const body = await request.json();
    const { lines, songId } = body as { lines: string[]; songId?: string };

    if (!lines?.length) return err("No lines provided");

    const enriched = await enrichLines(lines);

    if (songId) {
      for (let i = 0; i < enriched.length; i++) {
        const el = enriched[i];
        await updateLyricsLine(songId, i, {
          translation: el.translation,
          culturalNote: el.culturalNote,
        });
        for (const w of el.words) {
          await upsertWordEnrichment({
            id: `${songId}-${i}-${w.word}`,
            songId,
            word: w.word,
            definition: w.definition,
            partOfSpeech: w.partOfSpeech,
            example: w.example,
            difficulty: w.difficulty,
            lineIndex: i,
          });
        }
      }
    }

    return ok({ enriched });
  } catch (error) {
    return handleError(error);
  }
}
