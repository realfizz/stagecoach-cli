# stagecoach-cli

UK bus data CLI. Timetables, routes, fares, live positions from BODS.

## Use

When the user wants bus info: stop lookup, live tracking, routes, fares, operators.

## Commands

| Command | What |
|---------|------|
| `stagecoach init` | save BODS API key |
| `stagecoach stops <query>` | name, NaPTAN code, or `lat,lon` |
| `stagecoach live <target>` | vehicles near coords or stop |
| `stagecoach live route <id>` | vehicles on route |
| `stagecoach route <query>` | search timetable datasets |
| `stagecoach fare --query <q>` | search fare datasets |
| `stagecoach operators --query <q>` | search operators |

`--json` for structured output.

## Auth

```bash
stagecoach init --api-key <key>
```

Or `BODS_API_KEY` env var. Key at data.bus-data.dft.gov.uk.

## Notes

UK only. Timetables update daily ~06:00 GMT. Real-time every 10s.
