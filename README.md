# stagecoach-cli

A CLI tool for querying UK bus data from the Bus Open Data Service (BODS). Agent-first design — humans and AI agents use the same interface.

## Quick Start

```bash
# Install globally
npm install -g stagecoach-cli

# Or run without install
bunx stagecoach-cli

# Set up your API key
stagecoach init
```

## Features

- **Find stops** by name, NaPTAN code, or nearby location
- **Get departures** with real-time updates
- **Track live** bus positions
- **Look up routes** and patterns
- **Check fares** between stops
- **Search operators**

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `stagecoach init` | Set up BODS API key | `stagecoach init` |
| `stagecoach stops <query>` | Find stops by name, code, or location | `stagecoach stops "Magdalen Street"` |
| `stagecoach departures <stop>` | Next departures at a stop | `stagecoach departures 490008621A` |
| `stagecoach live <stop>` | Real-time vehicle positions | `stagecoach live 490008621A` |
| `stagecoach route <route>` | Route details and pattern | `stagecoach route 101` |
| `stagecoach fare <from> <to>` | Ticket prices between stops | `stagecoach fare "Oxford" "London"` |
| `stagecoach operators` | List all operators | `stagecoach operators` |
| `stagecoach version` | Version info | `stagecoach version` |

## Agent-Friendly Output

All commands support `--json` flag for structured output:

```bash
stagecoach stops "Magdalen Street" --json
stagecoach departures 490008621A --json
```

## Authentication

Get a free API key at [data.bus-data.dft.gov.uk](https://data.bus-data.dft.gov.uk/):

```bash
stagecoach init
```

The key is stored in `~/.config/stagecoach/config.json`. You can also set the `BODS_API_KEY` environment variable.

## Development

```bash
# Clone the repo
git clone https://github.com/your-username/stagecoach-cli.git
cd stagecoach-cli

# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test

# Build
bun run build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © stagecoach-cli contributors
