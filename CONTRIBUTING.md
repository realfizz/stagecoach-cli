# Contributing

## Setup

```bash
git clone https://github.com/realfizz/stagecoach-cli.git
cd stagecoach-cli
bun install
bun run src/cli.ts init --api-key <key>
```

## Commands

- `bun run dev` — run CLI
- `bun test` — run tests
- `bun run check` — lint + typecheck
- `bun run build` — build CLI bundle

## Commits

Format: `[area]: [thing]`. Lowercase, fragments, max 5-7 words.

Examples:
- `feat: add fare lookup command`
- `fix: handle empty stops response`
- `test: add route command tests`

## Pull Requests

Fork, branch, commit, push, PR. Run `bun run check && bun test` before pushing.

## Questions

Open an issue.
