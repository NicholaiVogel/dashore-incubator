Pull Request Guidelines
===

this guide covers how to create and manage pull requests for dashore incubator.

before creating a PR
===

pre-submission checklist
---

- [ ] code compiles without errors
- [ ] `bun run lint` passes
- [ ] tested locally with `bun run preview`
- [ ] no secrets in staged files
- [ ] commit messages follow [format](commit-messages.md)
- [ ] branch is up-to-date with main

sync with main
---

```bash
git checkout main
git pull origin main
git checkout <your-branch>
git rebase main
```

creating a pull request
===

using github cli
---

```bash
# push your branch
git push -u origin <username>/<feature-name>

# create PR
gh pr create --title "feat(scope): description" --body "$(cat <<'EOF'
## Summary
- brief description of what this PR does

## Test Plan
- [ ] tested locally with `bun run preview`
- [ ] lint passes

## Related Issues
Fixes #123
EOF
)"
```

PR description template
---

```markdown
## Summary
<!-- 1-3 bullet points describing the change -->
- implemented X feature
- fixed Y bug

## Test Plan
<!-- how was this tested? -->
- [ ] tested locally with `bun run preview`
- [ ] lint passes
- [ ] manually tested in browser

## Breaking Changes
<!-- if any, describe them -->
None

## Related Issues
<!-- link any related issues -->
Fixes #123
```

PR size guidelines
===

keep PRs focused and reviewable:

| Size | Lines Changed | Recommendation |
|------|---------------|----------------|
| Small | < 100 | ideal |
| Medium | 100-400 | acceptable |
| Large | 400-1000 | consider splitting |
| Huge | > 1000 | must split |

**if your PR is large:**

- split into logical, independent commits
- consider breaking into multiple PRs
- each PR should be independently mergeable

responding to review feedback
===

do
---

- respond to **all** comments
- explain your reasoning when you disagree
- make changes in **new commits** during review
- thank reviewers for their time

don't
---

- ignore comments
- get defensive
- force-push during active review (unless asked)

example responses
---

```
reviewer: "consider extracting this into a helper function"
author: "good idea! done in abc123."

reviewer: "should we add error handling here?"
author: "this path is only reached after validation, so the caller
guarantees valid input. added a comment to clarify."
```

after approval
===

merge strategy
---

we use **squash and merge**:

- combines all commits into one clean commit
- keeps main branch history clean
- preserves detailed history in the PR

post-merge
---

1. delete your feature branch (github does this automatically)
2. update local main: `git checkout main && git pull`

stale PRs
===

PRs without activity for 14+ days may be:

1. pinged for status update
2. labeled as "stale" after 21 days
3. closed after 30 days (can be reopened)

if you need more time, just comment to let us know!

next steps
===

- [commit-messages.md](commit-messages.md) - commit format reference
- [../CONTRIBUTING.md](../CONTRIBUTING.md) - full contribution guide
