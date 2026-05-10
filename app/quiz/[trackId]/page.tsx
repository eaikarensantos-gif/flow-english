import { notFound } from "next/navigation";
import { getSongById } from "@/lib/db";
import QuizShell from "@/components/quiz/QuizShell";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const song = await getSongById(trackId);
  if (!song) notFound();

  return (
    <div className="min-h-screen">
      <QuizShell trackId={song.id} songTitle={song.title} />
    </div>
  );
}
