import { rateLimit } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";

const HIP_HOP_WORD_BOOST = [
  "drip", "flex", "lit", "slay", "bars", "flow", "goat", "dope", "clout", "bread",
  "plug", "wave", "lowkey", "highkey", "fire", "hustle", "grind", "bag", "squad", "vibe",
  "finesse", "gas", "diss", "fade", "iced", "merch", "og", "peep", "rep", "spit",
  "steeze", "swag", "tax", "tight", "trill", "turnt", "whip", "woke", "yeet", "ratchet",
  "shade", "snitch", "cold", "cop", "hype", "raw", "sauce", "stack", "thug", "valid",
  "versed", "youngin", "cypher", "bounce", "bleed", "cook", "grip", "frontin", "lame",
];

const TEN_MINUTES_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    rateLimit(`transcribe:${ip}`, 5, 60_000);

    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;
    if (!audio) return err("No audio file provided");

    const buffer = await audio.arrayBuffer();

    // 1. Upload audio to AssemblyAI storage
    const uploadRes = await fetch("https://api.assemblyai.com/v1/upload", {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY ?? "",
        "Content-Type": "application/octet-stream",
        "Transfer-Encoding": "chunked",
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("AssemblyAI upload failed:", errorText);
      return err("Failed to upload audio for transcription", 502);
    }

    const { upload_url } = await uploadRes.json();

    // 2. Submit transcription job
    const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: upload_url,
        word_boost: HIP_HOP_WORD_BOOST,
        punctuate: true,
        format_text: true,
      }),
    });

    if (!transcriptRes.ok) {
      return err("Failed to start transcription", 502);
    }

    const { id: jobId } = await transcriptRes.json();
    return ok({ jobId });
  } catch (error) {
    return handleError(error);
  }
}
