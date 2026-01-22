Commit Message Guidelines
===

this guide covers the commit message format for dashore incubator contributions.

format
---

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

subject line
---

- **50 characters** maximum (72 hard limit)
- use **imperative mood:** "add feature" not "added feature"
- **no period** at the end
- include scope in parentheses when relevant

types
===

| Type | Description | Example |
|------|-------------|---------|
| `feat` | new feature | `feat(dashboard): add usage metrics chart` |
| `fix` | bug fix | `fix(auth): resolve redirect loop on logout` |
| `docs` | documentation only | `docs(readme): update installation steps` |
| `style` | formatting, whitespace | `style(ui): fix button alignment` |
| `refactor` | code change (no feature/fix) | `refactor(api): simplify auth middleware` |
| `perf` | performance improvement | `perf(dashboard): lazy load charts` |
| `test` | adding or updating tests | `test(auth): add login flow tests` |
| `build` | build system or dependencies | `build(deps): update next.js to 15.1` |
| `ci` | CI configuration | `ci(github): add lint workflow` |
| `chore` | maintenance tasks | `chore: clean up unused imports` |
| `revert` | reverting a previous commit | `revert: feat(dashboard): add metrics` |

scopes
---

common scopes for this project:

| Scope | Area |
|-------|------|
| `auth` | authentication system |
| `dashboard` | dashboard pages |
| `ui` | UI components |
| `api` | API routes |
| `middleware` | middleware |
| `deps` | dependencies |

scope is optional but helpful for larger changes.

examples
===

simple commit
---

```
feat(dashboard): add settings page
```

commit with body
---

```
fix(auth): resolve session timeout on idle

the session was expiring after 15 minutes of inactivity even when
the tab was open. increased timeout to 24 hours and added a
heartbeat to keep the session alive while the page is visible.

Fixes #42
```

breaking change
---

```
refactor(api)!: change auth callback response format

BREAKING CHANGE: the /api/auth/callback endpoint now returns
a redirect instead of JSON. update any code that parses the
response body.
```

body guidelines
---

when you need more detail:

- wrap at **72 characters** for readability
- explain **why** the change was made, not what (the diff shows what)
- reference related issues: `Fixes #123`, `Relates to #456`

why imperative mood?
===

git itself uses imperative mood:
- "Merge branch..."
- "Revert..."

your commits complete the sentence:

> "If applied, this commit will... **[your subject line]**"

examples:
- "If applied, this commit will **add user settings page**"
- "If applied, this commit will **fix login redirect bug**"

atomic commits
===

each commit should:

1. **represent ONE logical change**
2. **leave the project in a working state**
3. **be independently revertible**

bad
---

```
commit: "fix bug, add feature, update docs"
```

good
---

```
commit 1: "fix(auth): prevent redirect loop on logout"
commit 2: "feat(dashboard): add settings page"
commit 3: "docs(readme): update auth setup instructions"
```

next steps
===

- [pull-requests.md](pull-requests.md) - PR creation workflow
- [../CONTRIBUTING.md](../CONTRIBUTING.md) - full contribution guide
