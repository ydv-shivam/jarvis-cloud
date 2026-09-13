# JARVIS Cloud v3 — OpenAI Diagnostic Package

This is a temporary diagnostic build for the existing `jarvis-cloud` Worker.

## What changed

- Keeps `JARVIS_CLIENT_TOKEN` and `OPENAI_API_KEY` hidden.
- Logs only safe OpenAI error metadata to Cloudflare logs:
  - HTTP status
  - OpenAI request ID
  - error type
  - error code
  - error message
- The browser UI displays the same safe diagnostic information when OpenAI rejects a request.
- It does **not** display or log the API key or client token.

## Cloudflare settings

Worker name: `jarvis-cloud`

Root directory:
`/JARVIS_Cloud_v3_diag/worker`

Deploy command:
`npx wrangler deploy`

Required secrets (already configured on the Worker):
- `JARVIS_CLIENT_TOKEN`
- `OPENAI_API_KEY`

## After deployment

Open the JARVIS page, enter/save the existing client token, and send a simple message such as `hello jarvis`.

The page will show a `Diagnostic` section if OpenAI rejects the request.

You can also run:
`npx.cmd wrangler tail jarvis-cloud --format pretty`

Never paste an API key or client token into chat.
