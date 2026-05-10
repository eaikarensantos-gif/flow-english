import { notFound } from "next/navigation";
import { getSongById, getLyricsLines, getWordEnrichments } from "@/lib/db";
import PlayerShell from "@/components/player/PlayerShell";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  const [song, lines, enrichments] = await Promise.all([
    getSongById(trackId),
    getLyricsLines(trackId),
    getWordEnrichments(trackId),
  ]);

  if (!song) notFound();

  return (
    <PlayerShell
      song={song as any}
      lines={lines as any}
      enrichments={enrichments as any}
      audioUrl={null}
    />
  );
}
