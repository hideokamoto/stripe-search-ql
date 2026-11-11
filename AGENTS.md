# Agent guide

## Commit convention (required)

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, `test:`, `refactor:`, ...).

Agents MUST write Conventional Commit messages and must never bypass the hook
(`--no-verify`):

- Local: husky `commit-msg` hook runs commitlint with
  `@commitlint/config-conventional` (`commitlint.config.js`). Active after
  `pnpm install` (the `prepare` script runs `husky`, which sets `core.hooksPath`).
- The package manager is pnpm (`packageManager` in `package.json`). Do not commit
  `package-lock.json`.
- Releases are automated: merging to `main` runs semantic-release on CircleCI
  (config: `workflows/publish/npm-polyrepo-semantic-release.yaml` in `hideokamoto/circleci-configurations`).
  It decides the version from Conventional Commits since the last `v*` tag, pushes the tag,
  publishes to npm via OIDC trusted publishing, and creates the GitHub Release.
  Do not bump `version` in `package.json` by hand.
- Older releases used `np` (`npm run release`), whose version commit is a bare semver such
  as `0.2.1`. `commitlint.config.js` still ignores that form; do not write such messages by hand.
- `.github/pull_request_template.md` reminds contributors that the PR title should
  be a Conventional Commit (it becomes the squash-merge subject).
