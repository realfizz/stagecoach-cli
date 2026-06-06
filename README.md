# stagecoach-cli

> UK bus data in your terminal: timetables, routes, fares, and live vehicle positions from the [Bus Open Data Service](https://data.bus-data.dft.gov.uk/) (BODS).

Designed for humans and AI agents. Every command supports `--json` for structured output.

## Install

```bash
npm install -g stagecoach-cli
```

Or run without installing:

```bash
bunx stagecoach-cli --help
```

## Quick Start

```bash
stagecoach init                       # Save your BODS API key
stagecoach stops "Magdalen Street"    # Find a stop by name
stagecoach live 490008621A            # Live vehicles near a stop
stagecoach route "stagecoach" --json  # Search timetable datasets
```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Save your BODS API key | `stagecoach init` |
| `stops <query>` | Find stops by name, NaPTAN code, or `lat,lon` | `stagecoach stops "Oxford Circus"` |
| `live <target>` | Live vehicles near coordinates or a stop | `stagecoach live 51.752,-1.257` |
| `live route <id>` | Live vehicles on a specific route | `stagecoach live route 101` |
| `route <query>` | Search published timetable datasets | `stagecoach route "stagecoach"` |
| `fare` | Search fare datasets | `stagecoach fare --query blackpool` |
| `operators` | List or search operators | `stagecoach operators --query oxford` |
| `version` | Print version | `stagecoach version` |

Add `--json` to any command for agent-friendly output.

## Authentication

Get a free API key from [data.bus-data.dft.gov.uk](https://data.bus-data.dft.gov.uk/), then run:

```bash
stagecoach init
```

The key is stored in `~/.config/stagecoach/config.json`. You can also set `BODS_API_KEY` as an environment variable.

## Development

```bash
git clone https://github.com/your-org/stagecoach-cli.git
cd stagecoach-cli
bun install
bun run dev
bun test
bun run build
```

Run `bun run check` before committing (lint + typecheck).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
