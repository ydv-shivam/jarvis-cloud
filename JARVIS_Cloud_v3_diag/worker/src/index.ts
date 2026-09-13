export interface Env {
  OPENAI_API_KEY: string;
  JARVIS_CLIENT_TOKEN: string;
  ASSETS: Fetcher;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function authorized(request: Request, env: Env): boolean {
  return (request.headers.get("authorization") || "") === `Bearer ${env.JARVIS_CLIENT_TOKEN}`;
}

function redact(text: string): string {
  return text
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "[REDACTED_API_KEY]")
    .replace(/Bearer\s+[A-Za-z0-9._-]{8,}/gi, "Bearer [REDACTED]");
}

function safeOpenAIError(raw: string): {
  type?: string;
  code?: string;
  message?: string;
  raw_excerpt?: string;
} {
  const cleaned = redact(raw).slice(0, 1200);
  try {
    const parsed = JSON.parse(raw) as {
      error?: { type?: unknown; code?: unknown; message?: unknown };
    };
    const error = parsed?.error;
    return {
      type: typeof error?.type === "string" ? error.type : undefined,
      code: typeof error?.code === "string" ? error.code : undefined,
      message: typeof error?.message === "string" ? redact(error.message) : undefined,
      raw_excerpt: cleaned || undefined,
    };
  } catch {
    return { raw_excerpt: cleaned || undefined };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        name: "JARVIS Cloud",
        status: "online",
        auth_secret_present: Boolean(env.JARVIS_CLIENT_TOKEN),
        openai_secret_present: Boolean(env.OPENAI_API_KEY),
      });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "POST" || url.pathname !== "/v1/chat") {
      return env.ASSETS.fetch(request);
    }

    if (!authorized(request, env)) {
      return json({ error: "Unauthorized" }, 401);
    }

    let body: { message?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (typeof body.message !== "string" || !body.message.trim()) {
      return json({ error: "message must be a non-empty string" }, 400);
    }

    // Use the simplest valid Responses API input form for diagnosis.
    const openAIRequestBody = {
      model: "gpt-5.6",
      input: body.message.trim(),
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(openAIRequestBody),
    });

    if (!response.ok) {
      const raw = await response.text();
      const safe = safeOpenAIError(raw);
      const requestId = response.headers.get("x-request-id") || undefined;
      const contentType = response.headers.get("content-type") || undefined;

      // Safe diagnostics only. Never log or return the API key or client token.
      console.error("JARVIS OpenAI provider error", {
        status: response.status,
        request_id: requestId,
        content_type: contentType,
        body_length: raw.length,
        type: safe.type,
        code: safe.code,
        message: safe.message,
        raw_excerpt: safe.raw_excerpt,
      });

      return json(
        {
          error: "AI provider error",
          diagnostic: {
            status: response.status,
            request_id: requestId,
            content_type: contentType,
            body_length: raw.length,
            type: safe.type,
            code: safe.code,
            message: safe.message,
            raw_excerpt: safe.raw_excerpt,
          },
        },
        502,
      );
    }

    const data = (await response.json()) as { output_text?: string };
    return json({ reply: data.output_text ?? "", model: "gpt-5.6" });
  },
};
