import { ok, err, handleError } from "@/lib/apiResponse";
import { getSongById, getLyricsLines, getWordEnrichments } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const { trackId } = await params;
    const [song, lines, enrichments] = await Promise.all([
      getSongById(trackId),
      getLyricsLines(trackId),
      getWordEnrichments(trackId),
    ]);
    if (!song) return err("Song not found", 404);
    return ok({
      song,
      lines: lines.map((l) => l.text),
      words: enrichments.map((w) => ({
        word: w.word,
        definition: w.definition,
        partOfSpeech: w.partOfSpeech,
      })),
    });
  } catch (error) {
    return handleError(error);
  }
}
