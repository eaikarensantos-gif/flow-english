import { rateLimit } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";
import { createSong, createLyricsLines } from "@/lib/db";
import { alignLyricsToTimestamps } from "@/lib/lyrics";
import type { TimedWord } from "@/lib/lyrics";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    rateLimit(`songs:${ip}`, 10, 60_000);

    const body = await request.json();
    const { title, artist, album, year, level, coverUrl, geniusUrl, duration, lyrics, words } = body as {
      title: string;
      artist: string;
      album?: string;
      year?: number;
      level?: string;
      coverUrl?: string;
      geniusUrl?: string;
      duration?: number;
      lyrics: string[];
      words?: TimedWord[];
    };

    if (!title || !artist) return err("title and artist are required");

    const songId = randomBytes(8).toString("hex");

    await createSong({
      id: songId,
      title,
      artist,
      album,
      year,
      level: level ?? "intermediate",
      coverUrl,
      geniusUrl,
      duration,
      tags: JSON.stringify([]),
    });

    // Create aligned lyrics lines
    const aligned = alignLyricsToTimestamps(lyrics, words ?? []);
    await createLyricsLines(
      aligned.map((line) => ({
        id: `${songId}-${line.lineIndex}`,
        songId,
        lineIndex: line.lineIndex,
        text: line.text,
        ...(line.startMs != null && { startMs: line.startMs }),
        ...(line.endMs != null && { endMs: line.endMs }),
      }))
    );

    return ok({ songId });
  } catch (error) {
    return handleError(error);
  }
}
