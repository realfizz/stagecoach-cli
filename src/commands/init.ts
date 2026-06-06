import { Crust } from '@crustjs/core';
import { setBodsApiKey } from '~/config.js';

export const initCommand = new Crust('init')
  .meta({ description: 'Set up BODS API key' })
  .flags({
    'api-key': { type: 'string', description: 'BODS API key to save', short: 'k' },
  })
  .run(({ flags }) => {
    try {
      const apiKey = flags['api-key'] as string | undefined;
      if (apiKey) {
        setBodsApiKey(apiKey);
        console.log('API key saved');
      } else {
        console.log('Set up BODS API key');
        console.log('Usage: stagecoach init --api-key <your-api-key>');
        console.log('Or set BODS_API_KEY environment variable');
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });
