import { Crust } from '@crustjs/core';
import { BODS_DATAFEED_PATH, bodsFetchText } from '~/api/bods.js';
import { getStopByCode, isCoordinates, parseCoordinates } from '~/api/naptan.js';
import { runCommand } from '~/commands/_run.js';
import type { VehicleLocation } from '~/types.js';

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([^<]*)<\\/${tag}>`);
  const match = xml.match(regex);
  return match?.[1] || '';
}

export function parseSiriVmVehicles(xml: string): VehicleLocation[] {
  const vehicles: VehicleLocation[] = [];
  const activityRegex = /<VehicleActivity>([\s\S]*?)<\/VehicleActivity>/g;
  let match = activityRegex.exec(xml);

  while (match) {
    const activity = match[1] || '';
    const journeyMatch = activity.match(/<MonitoredVehicleJourney>([\s\S]*?)<\/MonitoredVehicleJourney>/);
    if (!journeyMatch) {
      match = activityRegex.exec(xml);
      continue;
    }
    const journey = journeyMatch[1] || '';

    const locMatch = journey.match(/<VehicleLocation>([\s\S]*?)<\/VehicleLocation>/);
    if (!locMatch) {
      match = activityRegex.exec(xml);
      continue;
    }
    const loc = locMatch[1] || '';

    const latitude = Number(extractTag(loc, 'Latitude'));
    const longitude = Number(extractTag(loc, 'Longitude'));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude === 0 || longitude === 0) {
      match = activityRegex.exec(xml);
      continue;
    }

    vehicles.push({
      vehicleRef: extractTag(journey, 'VehicleRef'),
      lineRef: extractTag(journey, 'LineRef'),
      publishedLineName: extractTag(journey, 'PublishedLineName'),
      operatorRef: extractTag(journey, 'OperatorRef'),
      originRef: extractTag(journey, 'OriginRef'),
      originName: extractTag(journey, 'OriginName'),
      destinationRef: extractTag(journey, 'DestinationRef'),
      destinationName: extractTag(journey, 'DestinationName'),
      latitude,
      longitude,
      bearing: Number(extractTag(journey, 'Bearing')) || 0,
      monitored: extractTag(journey, 'Monitored') === 'true',
      recordedAt: extractTag(activity, 'RecordedAtTime'),
    });

    match = activityRegex.exec(xml);
  }

  return vehicles;
}

export function createBoundingBox(lat: number, lon: number, radiusKm: number): string {
  const KM_PER_DEGREE_LAT = 111;
  const DEG_TO_RAD = Math.PI / 180;
  const latDelta = radiusKm / KM_PER_DEGREE_LAT;
  const lonDelta = radiusKm / (KM_PER_DEGREE_LAT * Math.cos(lat * DEG_TO_RAD));
  return `${lon - lonDelta},${lat - latDelta},${lon + lonDelta},${lat + latDelta}`;
}

export async function resolveTargetToBbox(target: string): Promise<string> {
  if (isCoordinates(target)) {
    const coords = parseCoordinates(target);
    if (!coords) {
      throw new Error('Invalid coordinates');
    }
    return createBoundingBox(coords.lat, coords.lon, 1);
  }
  const stop = await getStopByCode(target);
  if (!stop) {
    throw new Error(`Stop not found: ${target}`);
  }
  if (stop.Latitude == null || stop.Longitude == null) {
    throw new Error(`Stop has no location data: ${target}`);
  }
  return createBoundingBox(stop.Latitude, stop.Longitude, 1);
}

async function fetchVehiclesNearTarget(target: string): Promise<VehicleLocation[]> {
  const bbox = await resolveTargetToBbox(target);
  const xml = await bodsFetchText({
    path: BODS_DATAFEED_PATH,
    params: { boundingBox: bbox },
  });
  return parseSiriVmVehicles(xml);
}

async function fetchVehiclesOnRoute(route: string): Promise<VehicleLocation[]> {
  const xml = await bodsFetchText({
    path: BODS_DATAFEED_PATH,
    params: { lineRef: route },
  });
  return parseSiriVmVehicles(xml);
}

export function formatVehicles(vehicles: VehicleLocation[], label: string): string {
  let result = `Vehicles ${label}:\n`;
  for (const loc of vehicles) {
    result += `  ${loc.vehicleRef} (${loc.publishedLineName}): ${loc.latitude}, ${loc.longitude}\n`;
    result += `    ${loc.originName} → ${loc.destinationName}\n`;
    result += `    Operator: ${loc.operatorRef}\n`;
    result += '\n';
  }
  return result;
}

const liveCommand = new Crust('live')
  .meta({ description: 'Real-time vehicle positions' })
  .args([
    {
      name: 'target',
      type: 'string',
      description: 'Coordinates (lat,lon) or stop code',
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
  .run(({ args, flags }) => {
    const route = args.route as string;
    return runCommand({
      flags: { json: flags.json as boolean },
      empty: 'No vehicles found on this route',
      work: () => fetchVehiclesOnRoute(route),
      format: (vehicles) => formatVehicles(vehicles, `on route ${route}`),
    });
  });

export const liveCommandWithSubcommand = liveCommand.command(routeSubcommand).run(({ args, flags }) => {
  const target = args.target as string;
  return runCommand({
    flags: { json: flags.json as boolean },
    empty: 'No vehicles found near this location',
    work: () => fetchVehiclesNearTarget(target),
    format: (vehicles) => formatVehicles(vehicles, `near ${target}`),
  });
});
