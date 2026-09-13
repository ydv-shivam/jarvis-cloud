export interface Env {
  OPENAI_API_KEY: string;
  JARVIS_CLIENT_TOKEN: string;
  ASSETS: Fetcher;
}

const MODEL = "gpt-5.6";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type": "application/json; charset=utf-8"}
  });
}

function authorized(request: Request, env: Env): boolean {
  return request.headers.get("authorization") === `Bearer ${env.JARVIS_CLIENT_TOKEN}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({name: "JARVIS Cloud", status: "online"});
    }

    if (request.method === "POST" && url.pathname === "/v1/chat") {
      if (!authorized(request, env)) return json({error: "Unauthorized"}, 401);

      let body: {message?: unknown};
      try { body = await request.json(); }
      catch { return json({error: "Invalid JSON"}, 400); }

      if (typeof body.message !== "string" || !body.message.trim()) {
        return json({error: "message must be a non-empty string"}, 400);
      }

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          input: [
            {role: "system", content: "You are JARVIS, a safe personal AI assistant. Be clear and useful. Do not execute external actions in this version."},
            {role: "user", content: body.message.trim()}
          ]
        })
      });

      if (!response.ok) return json({error: "AI provider error", detail: await response.text()}, 502);

      const data = await response.json() as {output_text?: string};
      return json({reply: data.output_text ?? "", model: MODEL});
    }

    return env.ASSETS.fetch(request);
  }
};
