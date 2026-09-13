# JARVIS Cloud v3 — Final OpenAI Diagnostic

This build is for diagnosing the current OpenAI HTTP 400 response.

## Cloudflare settings
- Worker name: `jarvis-cloud`
- GitHub root directory: `/JARVIS_Cloud_v3_diag/worker`
- Build/deploy command: `npx wrangler deploy`

## Secrets
Keep the existing Cloudflare Worker secrets. Do not put them in this repository.

- `JARVIS_CLIENT_TOKEN`
- `OPENAI_API_KEY`

## What changed
- Uses the simplest Responses API `input` form.
- Keeps model `gpt-5.6`.
- If OpenAI rejects the request, the UI and Worker logs report safe diagnostic information: HTTP status, request ID, content type, body length, error type/code/message, and a short redacted response excerpt.
- API keys and client tokens are never logged or returned.

## Tail
After deployment:

```powershell
npx.cmd wrangler tail jarvis-cloud --format pretty
```

Then send `hello jarvis` once from the JARVIS page.
