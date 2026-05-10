export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { getSongs } = await import("@/lib/db");
    const songs = await getSongs();
    return Response.json({ ok: true, ts: Date.now(), songCount: songs.length, env: !!process.env.TURSO_DATABASE_URL });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message, env: !!process.env.TURSO_DATABASE_URL }, { status: 500 });
  }
}
