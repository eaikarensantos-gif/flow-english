import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlayerShell from "@/components/player/PlayerShell";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  const song = await prisma.song.findUnique({
    where: { id: trackId },
    include: {
      lyricsLines: { orderBy: { lineIndex: "asc" } },
      wordEnrichments: true,
    },
  });

  if (!song) notFound();

  return (
    <PlayerShell
      song={song as any}
      lines={song.lyricsLines as any}
      enrichments={song.wordEnrichments as any}
      audioUrl={null}
    />
  );
}
