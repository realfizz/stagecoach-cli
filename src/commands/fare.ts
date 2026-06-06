import { Crust } from '@crustjs/core';
import { BODS_FARES_LIMIT, BODS_FARES_PATH, type BodsResponse, bodsFetch } from '~/api/bods.js';
import { runCommand } from '~/commands/_run.js';
import type { FareDataset } from '~/types.js';

async function searchFares(query: string): Promise<FareDataset[]> {
  const data = await bodsFetch<BodsResponse<FareDataset>>({
    path: BODS_FARES_PATH,
    params: { status: 'published', limit: String(BODS_FARES_LIMIT), ...(query ? { search: query } : {}) },
  });

  return (data.results || []).map((r) => ({
    id: r.id,
    operatorName: r.operatorName || 'Unknown',
    description: r.description || '',
    noc: r.noc || [],
    status: r.status || '',
  }));
}

export const fareCommand = new Crust('fare')
  .meta({ description: 'Search for fare datasets' })
  .flags({
    query: {
      type: 'string',
      description: 'Search query (operator name, area, etc.)',
    },
    json: {
      type: 'boolean',
      description: 'Output as JSON',
      default: false,
    },
  })
  .run(({ flags }) => {
    const query = (flags.query as string) || '';
    return runCommand({
      flags: { json: flags.json as boolean },
      empty: 'No fare datasets found',
      work: () => searchFares(query),
      format: (fares) => {
        const label = query || 'all';
        let out = `Fare datasets (${label}):\n\n`;
        for (const fare of fares) {
          out += `${fare.operatorName} (Dataset #${fare.id})\n`;
          out += `  NOC: ${fare.noc.join(', ') || 'N/A'}\n`;
          out += `  ${fare.description}\n\n`;
        }
        return out;
      },
    });
  });
