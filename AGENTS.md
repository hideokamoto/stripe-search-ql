# Agent guide

## Commit convention (required)

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, `test:`, `refactor:`, ...).

Agents MUST write Conventional Commit messages and must never bypass the hook
(`--no-verify`):

- Local: husky `commit-msg` hook runs commitlint with
  `@commitlint/config-conventional` (`commitlint.config.js`). Active after
  `npm install` (the `prepare` script runs `husky`, which sets `core.hooksPath`).
- Releases use `np` (`npm run release`), whose version commit is a bare semver such as
  `0.2.1`. `commitlint.config.js` explicitly ignores that form; do not write such
  messages by hand.
- `.github/pull_request_template.md` reminds contributors that the PR title should
  be a Conventional Commit (it becomes the squash-merge subject).
