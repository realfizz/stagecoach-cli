import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { cleanupTestConfig, runCli, runCliExpectError, setupIsolatedConfigDir } from '~~/tests/helpers.js';

setupIsolatedConfigDir('live');

describe('stagecoach live', () => {
  beforeEach(() => cleanupTestConfig());
  afterEach(cleanupTestConfig);

  test('live command shows help', () => {
    const output = runCli('live --help');
    expect(output).toContain('live');
    expect(output).toContain('Real-time vehicle positions');
  });

  test('live route subcommand shows help', () => {
    const output = runCli('live route --help');
    expect(output).toContain('route');
    expect(output).toContain('All vehicles on a route');
  });

  test('live command shows error without API key', () => {
    cleanupTestConfig();
    const result = runCliExpectError('live 51.752,-1.257');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('BODS API key not configured');
  });
});
