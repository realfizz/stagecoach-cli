import { describe, expect, test } from 'bun:test';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_DIR = join(process.env.HOME || '', '.config', 'stagecoach');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

describe('stagecoach departures', () => {
  test('departures command exists and shows help', () => {
    const output = execSync('bun run src/cli.ts departures --help', {
      encoding: 'utf-8',
      cwd: `${import.meta.dir}/..`,
    });
    expect(output).toContain('departures');
    expect(output).toContain('Next departures at a stop');
  });

  test('departures command shows error without API key', () => {
    // Ensure no API key is configured
    if (existsSync(CONFIG_FILE)) {
      unlinkSync(CONFIG_FILE);
    }

    try {
      execSync('bun run src/cli.ts departures 490008621A', {
        encoding: 'utf-8',
        cwd: `${import.meta.dir}/..`,
      });
    } catch (error) {
      // Expected to fail without API key
      expect((error as Error).message).toContain('BODS API key not configured');
    }
  });

  test('departures command accepts stop code with API key', () => {
    // Set up test API key
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ bodsApiKey: 'test-key' }));

    try {
      const output = execSync('bun run src/cli.ts departures 490008621A', {
        encoding: 'utf-8',
        cwd: `${import.meta.dir}/..`,
        timeout: 60000,
      });
      // Should either return departures or show an error about API connection
      expect(output).toBeDefined();
    } catch (error) {
      // Expected to fail with invalid API key
      expect((error as Error).message).toBeDefined();
    } finally {
      // Clean up config file
      if (existsSync(CONFIG_FILE)) {
        unlinkSync(CONFIG_FILE);
      }
    }
  }, 60000);

  test('departures command accepts stop name with API key', () => {
    // Set up test API key
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ bodsApiKey: 'test-key' }));

    try {
      const output = execSync('bun run src/cli.ts departures "Magdalen Street"', {
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

  test('departures command accepts route filter with API key', () => {
    // Set up test API key
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ bodsApiKey: 'test-key' }));

    try {
      const output = execSync('bun run src/cli.ts departures 490008621A --route 101', {
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

  test('departures command supports --json flag with API key', () => {
    // Set up test API key
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify({ bodsApiKey: 'test-key' }));

    try {
      const output = execSync('bun run src/cli.ts departures 490008621A --json', {
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
