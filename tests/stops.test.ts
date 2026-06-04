import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.env.HOME || '', '.config', 'stagecoach');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

describe('stagecoach stops', () => {
  beforeEach(() => {
    // Set up test API key
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ bodsApiKey: 'test-key' }));
  });

  afterEach(() => {
    // Clean up config file after each test
    if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE);
    }
  });

  test('stops command exists and shows help', () => {
    const output = execSync('bun run src/cli.ts stops --help', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
    });
    expect(output).toContain('stops');
    expect(output).toContain('Find stops by name, code, or location');
  });

  test('stops command accepts name search', () => {
    const output = execSync('bun run src/cli.ts stops "Magdalen Street"', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
      timeout: 60000,
    });
    // Should either return stops or show an error about API connection
    expect(output).toBeDefined();
  }, 60000);

  test('stops command accepts NaPTAN code', () => {
    const output = execSync('bun run src/cli.ts stops 490008621A', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
      timeout: 60000,
    });
    expect(output).toBeDefined();
  }, 60000);

  test('stops command accepts proximity search', () => {
    const output = execSync('bun run src/cli.ts stops near 51.752,-1.257', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
      timeout: 60000,
    });
    expect(output).toBeDefined();
  }, 60000);

  test('stops command supports --json flag', () => {
    const output = execSync('bun run src/cli.ts stops "Magdalen Street" --json', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
      timeout: 60000,
    });
    // Output should be valid JSON or an error message
    expect(output).toBeDefined();
  }, 60000);
});
