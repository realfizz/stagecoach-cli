import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { cleanupTestConfig, runCli, runCliExpectError, setupIsolatedConfigDir, setupTestConfig } from '~~/tests/helpers.js';

setupIsolatedConfigDir('fare');

describe('stagecoach fare', () => {
  beforeEach(() => setupTestConfig());
  afterEach(cleanupTestConfig);

  test('fare command shows help', () => {
    const output = runCli('fare --help');
    expect(output).toContain('fare');
    expect(output).toContain('Search for fare datasets');
  });

  test('fare command shows error without API key', () => {
    cleanupTestConfig();
    const result = runCliExpectError('fare');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('BODS API key not configured');
  });

  test('fare --query shows error without API key', () => {
    cleanupTestConfig();
    const result = runCliExpectError('fare --query "stagecoach"');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('BODS API key not configured');
  });
});
