import { rateLimit } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    rateLimit(`identify:${ip}`, 10, 60_000);

    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;
    if (!audio) return err("No audio file provided");

    const outForm = new FormData();
    outForm.append("api_token", process.env.AUDD_API_KEY ?? "");
    outForm.append("return", "spotify,apple_music");
    outForm.append("file", audio, audio.name || "audio.mp3");

    const res = await fetch("https://api.audd.io/", {
      method: "POST",
      body: outForm,
    });

    if (!res.ok) return err("Audd.io request failed", 502);
    const data = await res.json();

    if (!data?.result) {
      return ok({ recognized: false });
    }

    const r = data.result;
    return ok({
      recognized: true,
      title: r.title,
      artist: r.artist,
      album: r.album,
      releaseDate: r.release_date,
      songLink: r.song_link,
      spotify: r.spotify,
      appleMusic: r.apple_music,
    });
  } catch (error) {
    return handleError(error);
  }
}
