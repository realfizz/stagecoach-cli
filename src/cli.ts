import { Crust } from '@crustjs/core';
import { helpPlugin, versionPlugin } from '@crustjs/plugins';
import pkg from '../package.json';
import { departuresCommand } from './commands/departures.js';
import { initCommand } from './commands/init.js';
import { liveCommandWithSubcommand } from './commands/live.js';
import { stopsCommand } from './commands/stops.js';

const cli = new Crust('stagecoach-cli')
  .meta({ description: 'A CLI built with Crust' })
  .use(versionPlugin(pkg.version))
  .use(helpPlugin())
  .command(initCommand)
  .command(stopsCommand)
  .command(departuresCommand)
  .command(liveCommandWithSubcommand)
  .run(() => {
    console.log('stagecoach-cli');
  });

await cli.execute();
