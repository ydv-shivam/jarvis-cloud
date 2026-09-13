# JARVIS Cloud v1
Cloud-first starter for a personal JARVIS assistant.

Architecture:
- Cloudflare Worker: secure API gateway
- OpenAI: primary reasoning provider
- Laptop/phone: clients
- Provider abstraction ready for future providers

IMPORTANT: Put secrets in Cloudflare secrets, not in source code.
See SETUP.md.
