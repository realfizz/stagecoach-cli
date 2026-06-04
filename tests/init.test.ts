import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.env.HOME || '', '.config', 'stagecoach');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

describe('stagecoach init', () => {
  beforeEach(() => {
    // Clean up config file before each test
    if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE);
    }
  });

  afterEach(() => {
    // Clean up config file after each test
    if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE);
    }
  });

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
    const output = execSync('bun run src/cli.ts init --help', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
    });
    expect(output).toContain('Set up BODS API key');
  });

  test('init command accepts API key via flag', () => {
    const output = execSync('bun run src/cli.ts init --api-key test-key-123', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
    });
    expect(output).toContain('API key saved');

    // Verify config file was created
    expect(existsSync(CONFIG_FILE)).toBe(true);

    // Verify config file contains the API key
    const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    expect(config.bodsApiKey).toBe('test-key-123');
  });

  test('BODS_API_KEY env var works as fallback', () => {
    const output = execSync('bun run src/cli.ts init --api-key env-test', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
      env: { ...process.env, BODS_API_KEY: 'env-key-456' },
    });
    expect(output).toContain('API key saved');
  });
});
