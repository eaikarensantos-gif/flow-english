import { load } from "cheerio";

interface GeniusHit {
  title: string;
  artist: string;
  lyricsUrl: string;
  coverUrl: string | null;
}

export async function searchGenius(query: string): Promise<GeniusHit | null> {
  const url = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.GENIUS_API_KEY}` },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.response?.hits?.[0]?.result;
  if (!hit) return null;

  return {
    title: hit.title,
    artist: hit.primary_artist?.name ?? "",
    lyricsUrl: hit.url,
    coverUrl: hit.song_art_image_thumbnail_url ?? null,
  };
}

export async function scrapeLyrics(pageUrl: string): Promise<string[]> {
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) return [];
  const html = await res.text();
  const $ = load(html);

  const lines: string[] = [];
  $('[data-lyrics-container="true"]').each((_, el) => {
    $(el).find("br").replaceWith("\n");
    const text = $(el).text();
    text.split("\n").forEach((l) => {
      const trimmed = l.trim();
      if (trimmed) lines.push(trimmed);
    });
  });

  return lines;
}
