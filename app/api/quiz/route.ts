import { rateLimit } from "@/lib/rateLimit";
import { ok, err, handleError } from "@/lib/apiResponse";
import { generateQuiz } from "@/lib/claude";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    rateLimit(`quiz:${ip}`, 10, 60_000);

    const body = await request.json();
    const { lines, words } = body as {
      lines: string[];
      words: Array<{ word: string; definition: string; partOfSpeech: string }>;
    };

    if (!lines?.length) return err("No lyrics provided");

    const questions = await generateQuiz(lines, words ?? []);
    return ok({ questions });
  } catch (error) {
    return handleError(error);
  }
}
