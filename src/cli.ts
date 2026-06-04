import { Crust } from '@crustjs/core';
import { helpPlugin, versionPlugin } from '@crustjs/plugins';
import pkg from '../package.json';
import { initCommand } from './commands/init.js';

const cli = new Crust('stagecoach-cli')
  .meta({ description: 'A CLI built with Crust' })
  .use(versionPlugin(pkg.version))
  .use(helpPlugin())
  .command(initCommand)
  .run(() => {
    console.log('stagecoach-cli');
  });

await cli.execute();
