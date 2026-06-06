import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { cleanupTestConfig, readTestConfig, runCli, setupIsolatedConfigDir } from '~~/tests/helpers.js';

setupIsolatedConfigDir('init');

describe('stagecoach init', () => {
  beforeEach(cleanupTestConfig);
  afterEach(cleanupTestConfig);

  test('init command shows help', () => {
    const output = runCli('init --help');
    expect(output).toContain('init');
    expect(output).toContain('Set up BODS API key');
  });

  test('init command accepts API key via flag', () => {
    const output = runCli('init --api-key test-key-123');
    expect(output).toContain('API key saved');

    const config = readTestConfig();
    expect(config.bodsApiKey).toBe('test-key-123');
  });

  test('init command shows usage when no key provided', () => {
    const output = runCli('init');
    expect(output).toContain('Usage:');
    expect(output).toContain('stagecoach init --api-key');
  });
});
