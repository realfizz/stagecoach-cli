import { describe, expect, test } from 'bun:test';
import { execSync } from 'node:child_process';

describe('stagecoach init', () => {
  test('init command exists and shows help', () => {
    const output = execSync('bun run src/cli.ts init --help', {
      encoding: 'utf-8',
      cwd: import.meta.dir + '/..',
    });
    expect(output).toContain('init');
  });
});
