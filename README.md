# stagecoach-cli

UK bus data. Timetables, routes, fares, live positions from BODS.

## Install

```bash
npm install -g stagecoach-cli
```

## Init

```bash
stagecoach init --api-key <key>
```

Get a key at [data.bus-data.dft.gov.uk](https://data.bus-data.dft.gov.uk/).

## Commands

| Command | What |
|---------|------|
| `stops <query>` | name, NaPTAN code, or `lat,lon` |
| `live <target>` | vehicles near coords or stop |
| `live route <id>` | vehicles on route |
| `route <query>` | search timetable datasets |
| `fare --query <q>` | search fare datasets |
| `operators --query <q>` | search operators |

`--json` on any command for structured output.

## Development

```bash
git clone https://github.com/realfizz/stagecoach-cli.git
cd stagecoach-cli
bun install
bun test
bun run build
```

## License

[MIT](LICENSE)
