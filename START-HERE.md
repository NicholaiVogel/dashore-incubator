Start Here
===

get up and running with dashore incubator development in 5 minutes.

prerequisites
---

**required:**

- **bun 1.0+** - [bun.sh](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`)
- **node.js 18+** - [nodejs.org](https://nodejs.org) (bun handles most things, but some tools need node)
- **git** - for version control

**optional:**

- **wrangler cli** - for cloudflare deployment (`bun add -g wrangler`)

quick start
===

1. clone and setup
---

```bash
# clone the repository (or your fork)
git clone https://github.com/dashore-incubator/dashore-incubator.git
cd dashore-incubator

# install dependencies
bun install
```

2. configure environment
---

```bash
# copy the example env file
cp .env.example .env.local

# edit .env.local with your values:
# - WORKOS_CLIENT_ID (from WorkOS dashboard)
# - WORKOS_API_KEY (from WorkOS dashboard)
# - WORKOS_COOKIE_PASSWORD (32+ random characters)
```

if you don't have WorkOS credentials, you can still run the app - you just won't be able to authenticate.

3. start development
---

```bash
# start the dev server with turbopack
bun dev
```

4. open in browser
---

navigate to **http://localhost:3000** - you should see the login page!

project structure
===

```
dashore-incubator/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes (auth callbacks)
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── actions/         # Server actions
│   │   └── page.tsx         # Login page
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui base components
│   │   └── ...              # App-specific components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   └── middleware.ts        # Auth middleware
├── Documentation/           # Contributor docs
├── .github/                 # GitHub workflows
├── CLAUDE.md                # AI assistant context
└── wrangler.jsonc           # Cloudflare config
```

key commands
===

```bash
# development
bun dev              # start dev server with turbopack (port 3000)
bun run lint         # run eslint

# cloudflare
bun run preview      # build and preview on cloudflare runtime
bun run deploy       # build and deploy to production
```

troubleshooting
===

"module not found" errors
---

```bash
# clear node_modules and reinstall
rm -rf node_modules .next
bun install
```

turbopack issues
---

```bash
# try without turbopack
bun run dev --no-turbo
```

auth not working
---

- check your `.env.local` has all required vars
- ensure WORKOS_COOKIE_PASSWORD is 32+ characters
- check the browser console for errors

build fails on cloudflare preview
---

```bash
# make sure opennext is building correctly
bun run build
# then try preview again
bun run preview
```

key files
===

| Purpose | File |
|---------|------|
| Main page (login) | `src/app/page.tsx` |
| Dashboard | `src/app/dashboard/page.tsx` |
| Auth middleware | `src/middleware.ts` |
| Auth callback | `src/app/api/auth/[...authkit]/route.ts` |
| Sign out action | `src/app/actions/auth.ts` |
| Sidebar component | `src/components/app-sidebar.tsx` |
| UI components | `src/components/ui/` |

development workflow
===

branch strategy
---

**never push to main.** always work on feature branches:

```bash
git checkout -b <username>/<feature-name>

# example
git checkout -b nicholai/add-settings-page
```

making changes
---

1. create a feature branch
2. make your changes
3. run `bun run lint` to check for issues
4. test with `bun run preview` (cloudflare runtime)
5. commit with conventional commits
6. open a PR

next steps
===

1. **explore the codebase** - start with `src/app/page.tsx`
2. **read CLAUDE.md** - understand the project context and conventions
3. **check issues** - find something to work on
4. **join discord** - ask questions, get help

welcome to the team!
