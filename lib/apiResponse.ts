import { ApiError } from "./errors";

export function ok(data: unknown, status = 200) {
  return Response.json({ ok: true, data }, { status });
}

export function err(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return err(error.message, error.status);
  }
  console.error(error);
  return err("Internal server error", 500);
}
