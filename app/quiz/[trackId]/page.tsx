import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizShell from "@/components/quiz/QuizShell";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  const song = await prisma.song.findUnique({
    where: { id: trackId },
    select: { id: true, title: true },
  });

  if (!song) notFound();

  return (
    <div className="min-h-screen">
      <QuizShell trackId={song.id} songTitle={song.title} />
    </div>
  );
}
