import { Crust } from '@crustjs/core';
import { getBodsApiKey } from '../config.js';

interface Fare {
  productName: string;
  price: number;
  currency: string;
  validFrom: string;
  validTo: string;
  description: string;
}

const BODS_API_BASE = 'https://data.bus-data.dft.gov.uk';

async function fetchFares(fromStop: string, toStop: string): Promise<Fare[]> {
  const apiKey = getBodsApiKey();

  if (!apiKey) {
    throw new Error('BODS API key not configured. Run: stagecoach init');
  }

  const url = `${BODS_API_BASE}/api/v1/bus/fares?from=${encodeURIComponent(fromStop)}&to=${encodeURIComponent(toStop)}&apiKey=${apiKey}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`BODS API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      fares?: Array<{
        productName: string;
        price: number;
        currency: string;
        validFrom: string;
        validTo: string;
        description: string;
      }>;
    };

    const fares: Fare[] = [];

    for (const fare of data.fares || []) {
      fares.push({
        productName: fare.productName,
        price: fare.price,
        currency: fare.currency,
        validFrom: fare.validFrom,
        validTo: fare.validTo,
        description: fare.description,
      });
    }

    return fares;
  } finally {
    clearTimeout(timeout);
  }
}

export const fareCommand = new Crust('fare')
  .meta({ description: 'Ticket prices between stops' })
  .args([
    {
      name: 'from',
      type: 'string',
      description: 'Origin stop name or code',
      required: true,
    },
    {
      name: 'to',
      type: 'string',
      description: 'Destination stop name or code',
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
      const fares = await fetchFares(args.from, args.to);

      if (flags.json) {
        console.log(JSON.stringify(fares, null, 2));
        return;
      }

      if (fares.length === 0) {
        console.log('No fares found');
        return;
      }

      console.log(`Fares from ${args.from} to ${args.to}:\n`);
      for (const fare of fares) {
        console.log(`${fare.productName}: ${fare.currency}${fare.price}`);
        console.log(`  ${fare.description}`);
        console.log(`  Valid: ${fare.validFrom} - ${fare.validTo}`);
        console.log('');
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });
