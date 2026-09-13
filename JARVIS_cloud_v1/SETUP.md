# JARVIS Cloud v1 — Phone-friendly setup

## 1. Edit only these items
You mainly need to configure:
- `worker/src/config.example.ts` -> copy to `config.ts` only if you want local configuration.
- Cloudflare secrets: `OPENAI_API_KEY` and `JARVIS_CLIENT_TOKEN`.

Do NOT paste real API keys into chat.

## 2. Cloudflare
Create a Cloudflare Worker and deploy the `worker` folder using Wrangler.

From a computer/Cloudflare-supported terminal:
  npm install
  npx wrangler login
  npx wrangler secret put OPENAI_API_KEY
  npx wrangler secret put JARVIS_CLIENT_TOKEN
  npx wrangler deploy

If you are doing this entirely from a phone, use Cloudflare's web dashboard/online development environment where available, or a remote development environment. The ZIP itself is ready to upload/use.

## 3. Test
POST JSON to `/v1/chat` with:
Authorization: Bearer YOUR_CLIENT_TOKEN

Body:
{"message":"Hello JARVIS"}

The response contains the model reply.

## 4. Security
The Worker requires a client token. Never expose the OpenAI key to the phone app/browser.
This v1 does not execute computer commands and does not install packages automatically.
