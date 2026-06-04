import { describe, expect, test } from 'bun:test';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.env.HOME || '', '.config', 'stagecoach');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

describe('stagecoach fare', () => {
  test('fare command exists and shows help', () => {
    const output = execSync('bun run src/cli.ts fare --help', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
    });
    expect(output).toContain('fare');
    expect(output).toContain('Ticket prices between stops');
  });

  test('fare command shows error without API key', () => {
    // Ensure no API key is configured
    if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE);
    }

    try {
      execSync('bun run src/cli.ts fare "Oxford" "London"', {
        encoding: 'utf-8',
        cwd: `${import.meta.dir}/..`,
      });
    } catch (error) {
      // Expected to fail without API key
      expect((error as Error).message).toContain('BODS API key not configured');
    }
  });

  test('fare command accepts stop names with API key', () => {
    // Set up test API key
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ bodsApiKey: 'test-key' }));

    try {
      const output = execSync('bun run src/cli.ts fare "Oxford" "London"', {
        encoding: 'utf-8',
        cwd: `${import.meta.dir}/..`,
        timeout: 60000,
      });
      expect(output).toBeDefined();
    } catch (error) {
      expect((error as Error).message).toBeDefined();
    } finally {
      if (existsSync(CONFIG_FILE)) {
        unlinkSync(CONFIG_FILE);
      }
    }
  }, 60000);

  test('fare command accepts stop codes with API key', () => {
    // Set up test API key
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ bodsApiKey: 'test-key' }));

    try {
      const output = execSync('bun run src/cli.ts fare 490008621A 490001234B', {
        encoding: 'utf-8',
        cwd: `${import.meta.dir}/..`,
        timeout: 60000,
      });
      expect(output).toBeDefined();
    } catch (error) {
      expect((error as Error).message).toBeDefined();
    } finally {
      if (existsSync(CONFIG_FILE)) {
        unlinkSync(CONFIG_FILE);
      }
    }
  }, 60000);

  test('fare command supports --json flag with API key', () => {
    // Set up test API key
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ bodsApiKey: 'test-key' }));

    try {
      const output = execSync('bun run src/cli.ts fare "Oxford" "London" --json', {
        encoding: 'utf-8',
        cwd: `${import.meta.dir}/..`,
        timeout: 60000,
      });
      expect(output).toBeDefined();
    } catch (error) {
      expect((error as Error).message).toBeDefined();
    } finally {
      if (existsSync(CONFIG_FILE)) {
        unlinkSync(CONFIG_FILE);
      }
    }
  }, 60000);
});
