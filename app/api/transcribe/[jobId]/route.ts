import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const res = await fetch(`https://api.assemblyai.com/v2/transcript/${jobId}`, {
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY ?? "",
      },
    });

    if (!res.ok) return err("Transcript not found", 404);

    const data = await res.json();
    return ok({
      status: data.status,
      text: data.text,
      words: data.words ?? [],
      utterances: data.utterances ?? [],
      error: data.error ?? null,
    });
  } catch (error) {
    return handleError(error);
  }
}
