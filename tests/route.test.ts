import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { cleanupTestConfig, runCli, runCliExpectError, setupIsolatedConfigDir, setupTestConfig } from '~~/tests/helpers.js';

setupIsolatedConfigDir('route');

describe('stagecoach route', () => {
  beforeEach(() => setupTestConfig());
  afterEach(cleanupTestConfig);

  test('route command shows help', () => {
    const output = runCli('route --help');
    expect(output).toContain('route');
    expect(output).toContain('Search timetable datasets');
  });

  test('route command shows error without API key', () => {
    cleanupTestConfig();
    const result = runCliExpectError('route 101');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('BODS API key not configured');
  });
});
