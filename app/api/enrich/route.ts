import { rateLimit } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";
import { enrichLines } from "@/lib/claude";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    rateLimit(`enrich:${ip}`, 20, 60_000);

    const body = await request.json();
    const { lines, songId } = body as { lines: string[]; songId?: string };

    if (!lines?.length) return err("No lines provided");

    const enriched = await enrichLines(lines);

    if (songId) {
      // Persist translations and words to DB
      const lineUpdates = enriched.map((el, i) =>
        prisma.lyricsLine.updateMany({
          where: { songId, lineIndex: i },
          data: {
            translation: el.translation,
            culturalNote: el.culturalNote,
            enrichedAt: new Date(),
          },
        })
      );

      const wordCreates = enriched.flatMap((el, lineIndex) =>
        el.words.map((w) =>
          prisma.wordEnrichment.upsert({
            where: { id: `${songId}-${lineIndex}-${w.word}` },
            update: {},
            create: {
              id: `${songId}-${lineIndex}-${w.word}`,
              songId,
              word: w.word,
              definition: w.definition,
              partOfSpeech: w.partOfSpeech,
              example: w.example,
              difficulty: w.difficulty,
              lineIndex,
            },
          })
        )
      );

      await Promise.all([...lineUpdates, ...wordCreates]);
    }

    return ok({ enriched });
  } catch (error) {
    return handleError(error);
  }
}
