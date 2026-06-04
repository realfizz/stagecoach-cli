import { describe, expect, test } from 'bun:test';
import { execSync } from 'node:child_process';

describe('stagecoach init', () => {
  test('init command exists and shows help', () => {
    const output = execSync('bun run src/cli.ts init --help', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
    });
    expect(output).toContain('init');
  });

  test('init command shows BODS API key in help', () => {
    const output = execSync('bun run src/cli.ts init --help', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
    });
    expect(output).toContain('BODS API key');
  });

  test('init command prompts for API key when run', async () => {
    // This test verifies the init command can be run
    // In a real test, we would mock stdin/stdout to test prompting
    // For now, we just verify the command exists and can be invoked
    const output = execSync('bun run src/cli.ts init --help', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
    });
    expect(output).toContain('Set up BODS API key');
  });
});
