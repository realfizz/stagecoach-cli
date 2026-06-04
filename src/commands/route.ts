import { Crust } from '@crustjs/core';
import { getBodsApiKey } from '../config.js';

interface RouteDetails {
  routeNumber: string;
  operatorName: string;
  origin: string;
  destination: string;
  stops: string[];
  description: string;
}

const BODS_API_BASE = 'https://data.bus-data.dft.gov.uk';

async function fetchRouteDetails(routeNumber: string): Promise<RouteDetails> {
  const apiKey = getBodsApiKey();

  if (!apiKey) {
    throw new Error('BODS API key not configured. Run: stagecoach init');
  }

  const url = `${BODS_API_BASE}/api/v1/bus/route/${encodeURIComponent(routeNumber)}?apiKey=${apiKey}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`BODS API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      routes?: Array<{
        routeNumber: string;
        operatorName: string;
        origin: string;
        destination: string;
        stops: string[];
        description: string;
      }>;
    };

    const route = data.routes?.[0];

    if (!route) {
      throw new Error(`Route ${routeNumber} not found`);
    }

    return {
      routeNumber: route.routeNumber,
      operatorName: route.operatorName,
      origin: route.origin,
      destination: route.destination,
      stops: route.stops || [],
      description: route.description,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const routeCommand = new Crust('route')
  .meta({ description: 'Route details and pattern' })
  .args([
    {
      name: 'route',
      type: 'string',
      description: 'Route number',
      required: true,
    },
  ])
  .flags({
    json: {
      type: 'boolean',
      description: 'Output as JSON',
      default: false,
    },
  })
  .run(async ({ args, flags }) => {
    try {
      const routeDetails = await fetchRouteDetails(args.route);

      if (flags.json) {
        console.log(JSON.stringify(routeDetails, null, 2));
        return;
      }

      console.log(`Route ${routeDetails.routeNumber}:\n`);
      console.log(`Operator: ${routeDetails.operatorName}`);
      console.log(`From: ${routeDetails.origin}`);
      console.log(`To: ${routeDetails.destination}`);
      console.log(`Description: ${routeDetails.description}`);
      console.log(`\nStops (${routeDetails.stops.length}):`);
      for (const stop of routeDetails.stops.slice(0, 10)) {
        console.log(`  - ${stop}`);
      }
      if (routeDetails.stops.length > 10) {
        console.log(`  ... and ${routeDetails.stops.length - 10} more stops`);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });
