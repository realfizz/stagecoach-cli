import { Crust } from '@crustjs/core';
import { getBodsApiKey } from '../config.js';

interface Operator {
  name: string;
  nocCode: string;
  servicesCount: number;
  description: string;
}

const BODS_API_BASE = 'https://data.bus-data.dft.gov.uk';

async function fetchOperators(searchQuery?: string): Promise<Operator[]> {
  const apiKey = getBodsApiKey();

  if (!apiKey) {
    throw new Error('BODS API key not configured. Run: stagecoach init');
  }

  let url = `${BODS_API_BASE}/api/v1/bus/operators?apiKey=${apiKey}`;

  if (searchQuery) {
    url += `&query=${encodeURIComponent(searchQuery)}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`BODS API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      operators?: Array<{
        name: string;
        nocCode: string;
        servicesCount: number;
        description: string;
      }>;
    };

    const operators: Operator[] = [];

    for (const op of data.operators || []) {
      operators.push({
        name: op.name,
        nocCode: op.nocCode,
        servicesCount: op.servicesCount,
        description: op.description,
      });
    }

    return operators;
  } finally {
    clearTimeout(timeout);
  }
}

export const operatorsCommand = new Crust('operators')
  .meta({ description: 'List all operators' })
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
  .run(async ({ flags }) => {
    try {
      const operators = await fetchOperators(flags.query as string | undefined);

      if (flags.json) {
        console.log(JSON.stringify(operators, null, 2));
        return;
      }

      if (operators.length === 0) {
        console.log('No operators found');
        return;
      }

      console.log(`Operators:\n`);
      for (const op of operators) {
        console.log(`${op.name} (${op.nocCode})`);
        console.log(`  Services: ${op.servicesCount}`);
        console.log(`  ${op.description}`);
        console.log('');
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });
