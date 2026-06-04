# stagecoach-cli

A CLI tool for querying UK bus data from the Bus Open Data Service (BODS).

## When to Use

Use this skill when the user wants to:
- Find bus stops by name, code, or location
- Get real-time departures at a bus stop
- Track live bus positions
- Look up route details and patterns
- Check ticket prices between stops
- List bus operators

## Commands

### `stagecoach init`

Set up your BODS API key.

```bash
stagecoach init
```

### `stagecoach stops`

Find bus stops by name, NaPTAN code, or nearby location.

```bash
# Search by name
stagecoach stops "Magdalen Street"

# Look up by NaPTAN code
stagecoach stops 490008621A

# Find nearby stops (lat,lon)
stagecoach stops 51.752,-1.257

# Output as JSON for agents
stagecoach stops "Magdalen Street" --json
```

### `stagecoach departures`

Get next departures at a bus stop.

```bash
# All departures
stagecoach departures 490008621A

# Filter by route
stagecoach departures 490008621A --route 101

# JSON output
stagecoach departures 490008621A --json
```

### `stagecoach live`

Track real-time vehicle positions.

```bash
# Vehicles at a stop
stagecoach live 490008621A

# All vehicles on a route
stagecoach live route 101

# JSON output
stagecoach live 490008621A --json
```

### `stagecoach route`

Get route details and patterns.

```bash
# Route info
stagecoach route 101

# JSON output
stagecoach route 101 --json
```

### `stagecoach fare`

Check ticket prices between stops.

```bash
# Fare between two stops
stagecoach fare "Oxford" "London"

# Using codes
stagecoach fare 490008621A 490001234B

# JSON output
stagecoach fare "Oxford" "London" --json
```

### `stagecoach operators`

List or search bus operators.

```bash
# List all operators
stagecoach operators

# Search operators
stagecoach operators --query "stagecoach"

# JSON output
stagecoach operators --json
```

## Output Formats

- **Plain text** (default): Human-readable tables and formatting
- **JSON** (`--json` flag): Structured output for agent consumption

## Authentication

- Run `stagecoach init` to set up your API key
- Key is stored in `~/.config/stagecoach/config.json`
- Environment variable `BODS_API_KEY` also supported as fallback

## Notes

- UK bus data only (England, Wales, Scotland)
- Requires free BODS API key (register at data.bus-data.dft.gov.uk)
- Timetables and fares update daily (~06:00 GMT)
- Real-time locations update every 10 seconds
