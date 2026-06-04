import { Crust } from '@crustjs/core';
import { getBodsApiKey } from '../config.js';

interface Departure {
  aimedDepartureTime: string;
  expectedDepartureTime: string;
  destinationName: string;
  routeNumber: string;
  operatorName: string;
  departureTime: Date;
  minutesUntilDeparture: number;
}

const BODS_API_BASE = 'https://data.bus-data.dft.gov.uk';

async function fetchDepartures(stopCode: string, routeNumber?: string): Promise<Departure[]> {
  const apiKey = getBodsApiKey();

  if (!apiKey) {
    throw new Error('BODS API key not configured. Run: stagecoach init');
  }

  const url = `${BODS_API_BASE}/api/v1/bus/stop/${encodeURIComponent(stopCode)}/live?apiKey=${apiKey}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`BODS API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      departures?: Array<{
        aimed_departure_time: string;
        expected_departure_time: string;
        destination_name: string;
        route: string;
        operator_name: string;
      }>;
    };

    const departures: Departure[] = [];
    const now = new Date();

    for (const dep of data.departures || []) {
      const departureTime = new Date(dep.aimed_departure_time);
      const minutesUntilDeparture = Math.round((departureTime.getTime() - now.getTime()) / 60000);

      if (routeNumber && dep.route !== routeNumber) {
        continue;
      }

      departures.push({
        aimedDepartureTime: dep.aimed_departure_time,
        expectedDepartureTime: dep.expected_departure_time,
        destinationName: dep.destination_name,
        routeNumber: dep.route,
        operatorName: dep.operator_name,
        departureTime,
        minutesUntilDeparture,
      });
    }

    return departures.sort((a, b) => a.departureTime.getTime() - b.departureTime.getTime());
  } finally {
    clearTimeout(timeout);
  }
}

export const departuresCommand = new Crust('departures')
  .meta({ description: 'Next departures at a stop' })
  .args([
    {
      name: 'stop',
      type: 'string',
      description: 'Stop code or name',
      required: true,
    },
  ])
  .flags({
    route: {
      type: 'string',
      description: 'Route number filter',
    },
    json: {
      type: 'boolean',
      description: 'Output as JSON',
      default: false,
    },
  })
  .run(async ({ args, flags }) => {
    try {
      const route = flags.route as string | undefined;
      const departures = await fetchDepartures(args.stop, route);

      if (flags.json) {
        console.log(JSON.stringify(departures, null, 2));
        return;
      }

      if (departures.length === 0) {
        console.log('No departures found');
        return;
      }

      console.log(`Departures from ${args.stop}:\n`);
      for (const dep of departures.slice(0, 10)) {
        const time = dep.minutesUntilDeparture <= 0 ? 'Now' : `${dep.minutesUntilDeparture} min`;
        console.log(`${dep.routeNumber} → ${dep.destinationName} (${time})`);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });
