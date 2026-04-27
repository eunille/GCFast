/**
 * Structured JSON logger for API requests.
 * Outputs one line per event — compatible with Vercel log viewer and external log aggregators.
 * Never include raw user input or PII values in log messages.
 */

interface RequestLogContext {
  userId?: string;
  role?: string;
}

export function logRequest(req: Request, ctx?: RequestLogContext): void {
  const url = new URL(req.url);
  console.log(
    JSON.stringify({
      event: "api_request",
      method: req.method,
      path: url.pathname,
      userId: ctx?.userId ?? null,
      role: ctx?.role ?? null,
      timestamp: new Date().toISOString(),
    })
  );
}

export function logError(error: unknown, path: string, userId?: string): void {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(
    JSON.stringify({
      event: "api_error",
      path,
      userId: userId ?? null,
      // Do NOT log the full stack — prevents internal detail leakage to log aggregators
      message,
      timestamp: new Date().toISOString(),
    })
  );
}
