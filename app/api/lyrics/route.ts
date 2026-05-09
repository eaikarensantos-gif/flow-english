export const dynamic = "force-dynamic";

import { rateLimit } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";
import { searchGenius, scrapeLyrics } from "@/lib/genius";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    rateLimit(`lyrics:${ip}`, 30, 60_000);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const geniusUrl = searchParams.get("geniusUrl");

    let lyricsUrl: string | null = geniusUrl;
    let coverUrl: string | null = null;
    let title = "";
    let artist = "";

    if (!lyricsUrl && query) {
      const hit = await searchGenius(query);
      if (!hit) return ok({ lyrics: [], found: false });
      lyricsUrl = hit.lyricsUrl;
      coverUrl = hit.coverUrl;
      title = hit.title;
      artist = hit.artist;
    }

    if (!lyricsUrl) return err("No query or geniusUrl provided");

    const lyrics = await scrapeLyrics(lyricsUrl);
    return ok({ lyrics, lyricsUrl, coverUrl, title, artist, found: lyrics.length > 0 });
  } catch (error) {
    return handleError(error);
  }
}
