import { ok, err, handleError } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params;
    const song = await prisma.song.findUnique({
      where: { id: trackId },
      include: {
        lyricsLines: { orderBy: { lineIndex: "asc" } },
        wordEnrichments: true,
      },
    });
    if (!song) return err("Song not found", 404);
    return ok({
      song,
      lines: song.lyricsLines.map((l) => l.text),
      words: song.wordEnrichments.map((w) => ({
        word: w.word,
        definition: w.definition,
        partOfSpeech: w.partOfSpeech,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
