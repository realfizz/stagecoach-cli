import { Crust } from '@crustjs/core';
import { getStopByCode, isCoordinates, isNaPTANCode, parseCoordinates, searchStopsByName, searchStopsByProximity } from '../api/naptan.js';

export const stopsCommand = new Crust('stops')
  .meta({ description: 'Find stops by name, code, or location' })
  .args([{ name: 'query', type: 'string', required: true }])
  .flags({
    json: { type: 'boolean', description: 'Output as JSON' },
  })
  .run(async ({ args, flags }) => {
    const query = args.query;
    let stops: Array<{
      AtcoCode: string;
      StopCode: string;
      Name: string;
      CommonName: string;
      Street: string;
      Indicator: string;
      Bearing: string;
      Locality: string;
      ParentLocalityName: string;
      Latitude: number;
      Longitude: number;
      StopType: string;
      TimingStatus: string;
      Status: string;
    }> = [];

    try {
      if (isNaPTANCode(query)) {
        // NaPTAN code lookup
        const stop = await getStopByCode(query);
        stops = stop ? [stop] : [];
      } else if (isCoordinates(query)) {
        // Proximity search
        const { lat, lon } = parseCoordinates(query);
        stops = await searchStopsByProximity(lat, lon);
      } else {
        // Name search
        stops = await searchStopsByName(query);
      }

      if (stops.length === 0) {
        console.log('No stops found');
        return;
      }

      if (flags.json) {
        console.log(JSON.stringify(stops, null, 2));
        return;
      }

      // Plain text output
      console.log(`Found ${stops.length} stop(s):\n`);
      for (const stop of stops) {
        const name = stop.CommonName || stop.Name;
        const indicator = stop.Indicator ? ` (${stop.Indicator})` : '';
        const street = stop.Street ? ` - ${stop.Street}` : '';
        console.log(`${name}${indicator}${street}`);
        console.log(`  Code: ${stop.AtcoCode}`);
        if (stop.Latitude && stop.Longitude) {
          console.log(`  Location: ${stop.Latitude}, ${stop.Longitude}`);
        }
        console.log('');
      }
    } catch (error) {
      console.error('Error fetching stops:', error);
      process.exit(1);
    }
  });
