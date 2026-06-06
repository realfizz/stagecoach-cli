import { defineConfig } from '@crustjs/crust';

export default defineConfig({
  entry: 'src/cli.ts',
  outDir: 'dist',
  target: 'bun',
});
