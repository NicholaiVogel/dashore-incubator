Dashore Incubator
===

Next.js app deployed to Cloudflare Workers via OpenNext.

Live at https://fortura.cc

**Note for AI Agents**: Do not overwrite CLAUDE.md or heavily modify .claude/ - these are version controlled with the codebase for continuity.

Contributing
---

- [START-HERE.md](START-HERE.md) - quick start for new contributors
- [CONTRIBUTING.md](CONTRIBUTING.md) - contribution workflow
- [Documentation/](Documentation/) - commit messages, PR guidelines, and more

Setup
---

Install dependencies:

    bun install

Copy the example env file and fill in your WorkOS credentials:

    cp .env.local.example .env.local

Required variables:
- WORKOS_CLIENT_ID - from WorkOS dashboard
- WORKOS_API_KEY - from WorkOS dashboard
- WORKOS_COOKIE_PASSWORD - 32+ character secret for session encryption

grepai (optional)
---

This project uses grepai for semantic code search: https://github.com/yoanbernabeu/grepai

Install:

    curl -sSL https://raw.githubusercontent.com/yoanbernabeu/grepai/main/install.sh | sh

Initialize and start the watch daemon:

    grepai init
    grepai watch

Search example:

    grepai search "authentication middleware" --json --compact

Development
---

    bun dev

Open http://localhost:3000

Preview
---

Preview locally on the Cloudflare runtime:

    bun run preview

Deploy
---

Deploy to Cloudflare Workers:

    bun run deploy

For production secrets:

    wrangler secret put WORKOS_CLIENT_ID
    wrangler secret put WORKOS_API_KEY
    wrangler secret put WORKOS_COOKIE_PASSWORD
