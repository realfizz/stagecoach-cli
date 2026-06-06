import { Crust } from '@crustjs/core';
import { getStopByCode, isCoordinates, isNaPTANCode, parseCoordinates, searchStopsByName, searchStopsByProximity } from '~/api/naptan.js';
import { runCommand } from '~/commands/_run.js';
import type { NaptanStop } from '~/types.js';

export async function searchStops(query: string): Promise<NaptanStop[]> {
  if (isNaPTANCode(query)) {
    const stop = await getStopByCode(query);
    return stop ? [stop] : [];
  }
  if (isCoordinates(query)) {
    const coords = parseCoordinates(query);
    if (!coords) {
      throw new Error('Invalid coordinates');
    }
    return searchStopsByProximity(coords.lat, coords.lon);
  }
  return searchStopsByName(query);
}

export const stopsCommand = new Crust('stops')
  .meta({ description: 'Find stops by name, code, or location' })
  .args([{ name: 'query', type: 'string', required: true }])
  .flags({
    json: { type: 'boolean', description: 'Output as JSON', default: false },
  })
  .run(({ args, flags }) => {
    const query = args.query;
    return runCommand({
      flags: { json: flags.json as boolean },
      empty: 'No stops found',
      work: () => searchStops(query),
      format: (stops) => {
        let out = `Found ${stops.length} stop(s):\n\n`;
        for (const stop of stops) {
          const name = stop.CommonName;
          const indicator = stop.Indicator ? ` (${stop.Indicator})` : '';
          const street = stop.Street ? ` - ${stop.Street}` : '';
          const town = stop.Town ? ` [${stop.Town}]` : '';
          out += `${name}${indicator}${street}${town}\n`;
          out += `  Code: ${stop.AtcoCode}\n`;
          if (stop.Latitude != null && stop.Longitude != null) {
            out += `  Location: ${stop.Latitude}, ${stop.Longitude}\n`;
          }
          out += '\n';
        }
        return out;
      },
    });
  });
