import { Crust } from '@crustjs/core';
import { BODS_DATASETS_PATH, BODS_OPERATORS_LIMIT, type BodsResponse, bodsFetch } from '~/api/bods.js';
import { runCommand } from '~/commands/_run.js';
import type { BodsDataset, Operator } from '~/types.js';

async function fetchOperators(searchQuery?: string): Promise<Operator[]> {
  const params: Record<string, string> = { status: 'published', limit: String(BODS_OPERATORS_LIMIT) };
  if (searchQuery) params.search = searchQuery;

  const data = await bodsFetch<BodsResponse<BodsDataset>>({
    path: BODS_DATASETS_PATH,
    params,
  });

  const operatorMap = new Map<string, Operator>();

  for (const r of data.results || []) {
    const name = r.operatorName || 'Unknown';
    const existing = operatorMap.get(name);
    if (existing) {
      existing.datasetsCount++;
    } else {
      operatorMap.set(name, {
        name,
        nocCode: (r.noc || []).join(', '),
        datasetsCount: 1,
        description: r.description || '',
      });
    }
  }

  return Array.from(operatorMap.values()).sort((a, b) => b.datasetsCount - a.datasetsCount);
}

export const operatorsCommand = new Crust('operators')
  .meta({ description: 'List operators from published timetable datasets' })
  .flags({
    query: {
      type: 'string',
      description: 'Search query',
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
      empty: 'No operators found',
      work: () => fetchOperators(query),
      format: (operators) => {
        const label = query || 'all';
        let out = `Operators (${label}):\n\n`;
        for (const op of operators) {
          out += `${op.name} (NOC: ${op.nocCode || 'N/A'})\n`;
          out += `  Datasets: ${op.datasetsCount}\n\n`;
        }
        return out;
      },
    });
  });
