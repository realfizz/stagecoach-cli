import { Crust } from '@crustjs/core';
import { helpPlugin, versionPlugin } from '@crustjs/plugins';
import { fareCommand } from '~/commands/fare.js';
import { initCommand } from '~/commands/init.js';
import { liveCommandWithSubcommand } from '~/commands/live.js';
import { operatorsCommand } from '~/commands/operators.js';
import { routeCommand } from '~/commands/route.js';
import { stopsCommand } from '~/commands/stops.js';
import pkg from '~~/package.json';

const cli = new Crust('stagecoach-cli')
  .meta({ description: 'UK bus data CLI: timetables, routes, fares, live positions' })
  .use(versionPlugin(pkg.version))
  .use(helpPlugin())
  .command(initCommand)
  .command(stopsCommand)
  .command(liveCommandWithSubcommand)
  .command(routeCommand)
  .command(fareCommand)
  .command(operatorsCommand);

await cli.execute();
