import { Crust } from '@crustjs/core';

export const initCommand = new Crust('init').meta({ description: 'Set up BODS API key' }).run(() => {
  console.log('init command called');
});
