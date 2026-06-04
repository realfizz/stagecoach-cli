import { Crust } from '@crustjs/core';
import { getBodsApiKey } from '../config.js';

interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  destination: string;
  routeNumber: string;
  operatorName: string;
  originStop: string;
  timestamp: Date;
}

const BODS_API_BASE = 'https://data.bus-data.dft.gov.uk';

async function fetchVehicleLocations(stopCode: string): Promise<VehicleLocation[]> {
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
      vehicles?: Array<{
        vehicleId: string;
        latitude: number;
        longitude: number;
        heading: number;
        speed: number;
        destination: string;
        route: string;
        operatorName: string;
        originStop: string;
        timestamp: string;
      }>;
    };

    const locations: VehicleLocation[] = [];

    for (const vehicle of data.vehicles || []) {
      locations.push({
        vehicleId: vehicle.vehicleId,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        heading: vehicle.heading,
        speed: vehicle.speed,
        destination: vehicle.destination,
        routeNumber: vehicle.route,
        operatorName: vehicle.operatorName,
        originStop: vehicle.originStop,
        timestamp: new Date(vehicle.timestamp),
      });
    }

    return locations;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchVehiclesByRoute(routeNumber: string): Promise<VehicleLocation[]> {
  const apiKey = getBodsApiKey();

  if (!apiKey) {
    throw new Error('BODS API key not configured. Run: stagecoach init');
  }

  const url = `${BODS_API_BASE}/api/v1/bus/route/${encodeURIComponent(routeNumber)}/live?apiKey=${apiKey}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`BODS API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      vehicles?: Array<{
        vehicleId: string;
        latitude: number;
        longitude: number;
        heading: number;
        speed: number;
        destination: string;
        route: string;
        operatorName: string;
        originStop: string;
        timestamp: string;
      }>;
    };

    const locations: VehicleLocation[] = [];

    for (const vehicle of data.vehicles || []) {
      locations.push({
        vehicleId: vehicle.vehicleId,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        heading: vehicle.heading,
        speed: vehicle.speed,
        destination: vehicle.destination,
        routeNumber: vehicle.route,
        operatorName: vehicle.operatorName,
        originStop: vehicle.originStop,
        timestamp: new Date(vehicle.timestamp),
      });
    }

    return locations;
  } finally {
    clearTimeout(timeout);
  }
}

const liveCommand = new Crust('live')
  .meta({ description: 'Real-time vehicle positions' })
  .args([
    {
      name: 'target',
      type: 'string',
      description: 'Stop code or route number',
      required: true,
    },
  ])
  .flags({
    json: {
      type: 'boolean',
      description: 'Output as JSON',
      default: false,
    },
  });

const routeSubcommand = new Crust('route')
  .meta({ description: 'All vehicles on a route' })
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
      const locations = await fetchVehiclesByRoute(args.route);

      if (flags.json) {
        console.log(JSON.stringify(locations, null, 2));
        return;
      }

      if (locations.length === 0) {
        console.log('No vehicles found on this route');
        return;
      }

      console.log(`Vehicles on route ${args.route}:\n`);
      for (const loc of locations) {
        console.log(`Vehicle ${loc.vehicleId}: ${loc.latitude}, ${loc.longitude}`);
        console.log(`  Heading: ${loc.heading}°, Speed: ${loc.speed} mph`);
        console.log(`  Destination: ${loc.destination}`);
        console.log('');
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

export const liveCommandWithSubcommand = liveCommand.command(routeSubcommand).run(async ({ args, flags }) => {
  try {
    const locations = await fetchVehicleLocations(args.target);

    if (flags.json) {
      console.log(JSON.stringify(locations, null, 2));
      return;
    }

    if (locations.length === 0) {
      console.log('No vehicles found near this stop');
      return;
    }

    console.log(`Vehicles near ${args.target}:\n`);
    for (const loc of locations) {
      console.log(`Vehicle ${loc.vehicleId}: ${loc.latitude}, ${loc.longitude}`);
      console.log(`  Heading: ${loc.heading}°, Speed: ${loc.speed} mph`);
      console.log(`  Destination: ${loc.destination}`);
      console.log('');
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
});
