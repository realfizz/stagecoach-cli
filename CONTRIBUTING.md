# Contributing to stagecoach-cli

Thank you for your interest in contributing! This document provides guidelines and information about contributing to this project.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Git
- A BODS API key (for testing - get one at [data.bus-data.dft.gov.uk](https://data.bus-data.dft.gov.uk/))

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/stagecoach-cli.git
   cd stagecoach-cli
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up your API key:
   ```bash
   bun run src/cli.ts init
   ```

### Development Commands

- `bun run dev` - Run the CLI in development mode
- `bun run lint` - Run Biome linter
- `bun run lint:fix` - Auto-fix lint issues
- `bun run typecheck` - Run TypeScript type checking
- `bun run check` - Run both lint and typecheck
- `bun run test` - Run tests
- `bun run build` - Build the CLI

## Code Quality

### Biome

We use [Biome](https://biomejs.dev/) for linting and formatting. The configuration is in `biome.json`.

Key rules:
- Line width: 300 characters max
- Strict TypeScript rules (no `any`, no floating promises, explicit types)
- No unused variables
- Block statements required

### TypeScript

We use strict TypeScript configuration:
- `verbatimModuleSyntax: true` - Use `import type` for type-only imports
- `noUncheckedIndexedAccess: true` - Handle array/object indexing safely
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - No unused parameters

### Pre-commit Hooks

We use [Lefthook](https://github.com/evilmartians/lefthook) for pre-commit hooks. They run automatically when you commit:

- Biome check (lint + format)
- TypeScript type checking

## Testing

We use Bun's built-in test runner. Tests are in the `tests/` directory.

### Writing Tests

1. Create a test file: `tests/your-feature.test.ts`
2. Follow the existing test patterns
3. Use descriptive test names
4. Mock external APIs when testing error cases

### Running Tests

```bash
bun test
```

## Git Commit Messages

We follow a simple convention:
- Format: `[area]: [thing]`
- Lowercase only
- Fragments, not full sentences
- Max 5-7 words

Examples:
- `feat: add fare lookup command`
- `fix: handle empty stops response`
- `test: add route command tests`

## Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the guidelines above
4. Run tests and linting: `bun run check && bun test`
5. Commit with a clear message
6. Push to your fork
7. Open a Pull Request

### PR Guidelines

- Keep PRs focused on a single change
- Include tests for new features
- Update documentation if needed
- Ensure all checks pass

## Issues

- Use GitHub Issues for bug reports and feature requests
- Provide as much detail as possible
- Include steps to reproduce for bugs

## Code of Conduct

Please be respectful and constructive in all interactions.

## Questions?

If you have questions about contributing, feel free to open an issue.
