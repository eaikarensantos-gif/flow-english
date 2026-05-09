import { RateLimitError } from "./errors";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count++;
  if (bucket.count > max) {
    throw new RateLimitError();
  }
}
