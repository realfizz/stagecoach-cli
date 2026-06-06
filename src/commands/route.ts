import { Crust } from '@crustjs/core';
import { BODS_DATASETS_LIMIT, BODS_DATASETS_PATH, type BodsResponse, bodsFetch } from '~/api/bods.js';
import { runCommand } from '~/commands/_run.js';
import type { BodsDataset, RouteInfo } from '~/types.js';

async function searchTimetables(query: string): Promise<RouteInfo[]> {
  const data = await bodsFetch<BodsResponse<BodsDataset>>({
    path: BODS_DATASETS_PATH,
    params: { search: query, status: 'published', limit: String(BODS_DATASETS_LIMIT) },
  });

  return (data.results || []).map((r) => ({
    operatorName: r.operatorName || 'Unknown',
    description: r.description || '',
    lines: r.lines || [],
    adminAreas: (r.adminAreas || []).map((a) => a.name),
    datasetId: r.id,
  }));
}

export const routeCommand = new Crust('route')
  .meta({ description: 'Search timetable datasets' })
  .args([
    {
      name: 'query',
      type: 'string',
      description: 'Route number or operator name',
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
    const query = args.query;
    return runCommand({
      flags: { json: flags.json as boolean },
      empty: 'No matching timetable datasets found',
      work: () => searchTimetables(query),
      format: (routes) => {
        let out = `Timetable datasets matching "${query}":\n\n`;
        for (const route of routes) {
          out += `${route.operatorName} (Dataset #${route.datasetId})\n`;
          out += `  Lines: ${route.lines.join(', ') || 'N/A'}\n`;
          out += `  Areas: ${route.adminAreas.join(', ') || 'N/A'}\n`;
          out += `  ${route.description}\n\n`;
        }
        return out;
      },
    });
  });
