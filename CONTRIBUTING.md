Contributing to Dashore Incubator
===

thanks for your interest in contributing! this document will help you get started.

quick links
---

- [START-HERE.md](START-HERE.md) - get your dev environment running
- [Documentation/commit-messages.md](Documentation/commit-messages.md) - commit format guide
- [Documentation/pull-requests.md](Documentation/pull-requests.md) - PR workflow
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - community standards

contribution workflow
===

1. fork & clone
---

```bash
# fork the repo on github, then clone your fork
git clone https://github.com/YOUR_USERNAME/dashore-incubator.git
cd dashore-incubator

# add upstream remote
git remote add upstream https://github.com/dashore-incubator/dashore-incubator.git
```

2. create a feature branch
---

**never push directly to main.** always work on feature branches:

```bash
git checkout main
git pull upstream main
git checkout -b <username>/<feature-name>

# examples:
git checkout -b nicholai/add-dark-mode
git checkout -b kevin/fix-auth-redirect
```

3. make your changes
---

- read existing code first, understand the patterns
- follow the project's coding conventions
- run linting before committing
- test your changes locally with `bun run preview`

4. commit your changes
---

use [conventional commits](Documentation/commit-messages.md):

```bash
git commit -m "feat(dashboard): add usage metrics chart"
```

**commit types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

5. create a pull request
---

see [PR guidelines](Documentation/pull-requests.md) for details:

```bash
git push -u origin <username>/<feature-name>

# create PR via github or gh cli
gh pr create --title "feat(dashboard): add usage metrics chart" --body "..."
```

6. address review feedback
---

respond to all review comments. we use squash-and-merge, so your commits will be combined.

critical rules
===

these are non-negotiable:

1. **never push to main** - always use feature branches
2. **lint must pass** - run `bun run lint` before committing
3. **test locally** - run `bun run preview` to test on cloudflare runtime
4. **follow existing patterns** - match the codebase style

types of contributions
===

bug reports
---

found a bug? [create an issue](https://github.com/dashore-incubator/dashore-incubator/issues/new) with:

- clear description of the problem
- steps to reproduce
- expected vs actual behavior
- environment details (browser, OS)

feature requests
---

have an idea? open a discussion first to gauge interest before implementing.

code contributions
---

1. check existing issues for tasks
2. comment on an issue to claim it
3. follow the workflow above
4. keep PRs focused and reasonably sized

documentation
---

documentation improvements are always welcome! follow the same PR process.

ai-assisted development
===

this project welcomes contributions made with AI coding assistants (Claude Code, Cursor, etc.). if you're using one:

- be transparent about AI assistance in your PRs
- review and understand all generated code
- ensure AI output follows project conventions
- you're responsible for the code you submit

getting help
===

- **discord:** join our community for questions and discussion
- **issues:** check existing issues or create a new one
- **CLAUDE.md:** AI assistant guidelines and project context

code of conduct
===

please read our [Code of Conduct](CODE_OF_CONDUCT.md). we're committed to a welcoming and inclusive environment for all contributors.

thanks for contributing!
