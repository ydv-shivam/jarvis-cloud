# JARVIS Cloud v2

A ready-to-deploy Cloudflare Worker with a browser chat interface and OpenAI backend.

Keep these Cloudflare secrets:
- OPENAI_API_KEY
- JARVIS_CLIENT_TOKEN

If the outer package folder is uploaded to GitHub, Cloudflare Worker root is:
`/JARVIS_Cloud_v2/worker`

Do not put OPENAI_API_KEY in GitHub or browser code.
The browser token is for initial private testing; stronger authentication will be added later.
