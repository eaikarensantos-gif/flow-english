export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class RateLimitError extends ApiError {
  constructor() {
    super(429, "Too many requests. Please try again later.");
  }
}

export class UpstreamError extends ApiError {
  constructor(service: string) {
    super(502, `${service} is currently unavailable. Please try again.`);
  }
}
