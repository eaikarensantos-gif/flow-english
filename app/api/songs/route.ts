import { rateLimit } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";
import { alignLyricsToTimestamps } from "@/lib/lyrics";
import type { TimedWord } from "@/lib/lyrics";

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

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        album,
        year,
        level: level ?? "intermediate",
        coverUrl,
        geniusUrl,
        duration,
        tags: JSON.stringify([]),
      },
    });

    // Create aligned lyrics lines
    const aligned = alignLyricsToTimestamps(lyrics, words ?? []);
    await prisma.lyricsLine.createMany({
      data: aligned.map((line) => ({
        songId: song.id,
        lineIndex: line.lineIndex,
        text: line.text,
        startMs: line.startMs,
        endMs: line.endMs,
      })),
    });

    return ok({ songId: song.id });
  } catch (error) {
    return handleError(error);
  }
}
