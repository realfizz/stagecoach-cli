import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { cleanupTestConfig, runCli, runCliExpectError, setupIsolatedConfigDir, setupTestConfig } from '~~/tests/helpers.js';

setupIsolatedConfigDir('operators');

describe('stagecoach operators', () => {
  beforeEach(() => setupTestConfig());
  afterEach(cleanupTestConfig);

  test('operators command shows help', () => {
    const output = runCli('operators --help');
    expect(output).toContain('operators');
    expect(output).toContain('List operators from published timetable datasets');
  });

  test('operators command shows error without API key', () => {
    cleanupTestConfig();
    const result = runCliExpectError('operators');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('BODS API key not configured');
  });
});
