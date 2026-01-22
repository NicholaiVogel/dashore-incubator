CLAUDE.md
===

This file provides guidance to Claude Code (claude.ai/code) and Opencode (opencode.ai) when working with code in this repository.

IMPORTANT: DO NOT overwrite this file or heavily modify .claude/ - these are version controlled and contain customizations from users and agents.

formatting
===

keep markdown minimal. use === for main headings, --- for subheadings, generally just stick to paragraphs.
*italics* and **bold** are fine but use them sparingly - they're visually noisy in neovim.

- bullet points like this are okay
- numbered lists are okay too

codeblocks ``` are fine, but these tend to get visually noisy when used too much.
no excessive formatting. keep it clean and readable.

line width
---

- soft limit: 80-100 chars (forces clear thinking, works on split screens)
- hard limit: 120 chars max
- exceptions: user-visible strings (error messages, logs - must stay on one line for grep-ability), URLs, long literals

project overview
===

dashore incubator - a Next.js 15 app deployed to Cloudflare Workers via OpenNext. live at https://fortura.cc

uses bun as the package manager.

contributing
---

contributor documentation lives in:

- [START-HERE.md](START-HERE.md) - quick start for new contributors
- [CONTRIBUTING.md](CONTRIBUTING.md) - contribution workflow
- [Documentation/](Documentation/) - commit messages, PR guidelines, UI guidelines, and more
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - community standards
- [SECURITY.md](SECURITY.md) - vulnerability reporting

commands
===

development
---

    bun dev          # start dev server with turbopack (localhost:3000)
    bun run lint     # run eslint

cloudflare
---

    bun run preview  # build and preview locally on cloudflare runtime
    bun run deploy   # build and deploy to cloudflare workers

secrets for production are set via wrangler:

    wrangler secret put WORKOS_CLIENT_ID
    wrangler secret put WORKOS_API_KEY
    wrangler secret put WORKOS_COOKIE_PASSWORD

architecture
===

auth flow
---

uses WorkOS AuthKit for authentication:

- src/middleware.ts - authkitMiddleware protects all routes except `/`
- src/app/api/auth/[...authkit]/route.ts - handles auth callbacks, redirects to /dashboard
- src/app/actions/auth.ts - server action for sign out
- src/app/layout.tsx - wraps app in AuthKitProvider with initial auth state

route protection: middleware redirects unauthenticated users. individual pages use `withAuth()` to get user and redirect if needed.

page structure
---

- / - login page, redirects to /dashboard if already authenticated
- /dashboard - main app with sidebar layout (SidebarProvider pattern)

ui components
---

shadcn/ui components in src/components/ui/ - standard radix-based components.

custom components in src/components/:
- app-sidebar.tsx - main navigation sidebar
- site-header.tsx - top header
- section-cards.tsx, chart-area-interactive.tsx, data-table.tsx - dashboard widgets

icons from @tabler/icons-react.

env vars
---

required in .env.local for local dev (see .env.example):

- WORKOS_CLIENT_ID
- WORKOS_API_KEY
- WORKOS_COOKIE_PASSWORD (32+ chars)

git 
---

don't assume it's okay to commit or push or perform git operations, and when performing a commit, do not give yourself or anthropic attribution.

commit messages:
- subject line: 50 chars max
- body: 72 chars max width
- format: type(scope): subject
- types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- use imperative mood ("add feature" not "added feature")

grepai
===

**IMPORTANT: use grepai as the PRIMARY tool for code exploration and search.**

when to use grepai (required)
---

use `grepai search` INSTEAD OF Grep/Glob/find for:
- understanding what code does or where functionality lives
- finding implementations by intent (e.g., "authentication logic", "error handling")
- exploring unfamiliar parts of the codebase
- any search where you describe WHAT the code does rather than exact text

when to use standard tools
---

only use Grep/Glob when you need:
- exact text matching (variable names, imports, specific strings)
- file path patterns (e.g., `**/*.tsx`)

fallback: if grepai fails (not running, index unavailable, or errors), fall back to standard Grep/Glob tools.

usage
---

    grepai search "user authentication flow" --json --compact
    grepai search "error handling middleware" --json --compact

query tips:
- use English for queries (better semantic matching)
- describe intent, not implementation: "handles user login" not "func Login"
- be specific: "JWT token validation" better than "token"

call graph tracing
---

use `grepai trace` to understand function relationships:

    grepai trace callers "HandleRequest" --json
    grepai trace callees "ProcessOrder" --json
    grepai trace graph "ValidateToken" --depth 3 --json
