import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { getBodsApiKey, setBodsApiKey } from '~/config.js';
import { cleanupTestConfig, readTestConfig, setupIsolatedConfigDir } from '~~/tests/helpers.js';

setupIsolatedConfigDir('config');

describe('config', () => {
  beforeEach(() => {
    delete process.env.BODS_API_KEY;
    cleanupTestConfig();
  });
  afterEach(cleanupTestConfig);

  test('setBodsApiKey saves key to config', () => {
    setBodsApiKey('test-key-123');
    const config = readTestConfig();
    expect(config.bodsApiKey).toBe('test-key-123');
  });

  test('getBodsApiKey reads saved key', () => {
    setBodsApiKey('my-api-key');
    const key = getBodsApiKey();
    expect(key).toBe('my-api-key');
  });

  test('setBodsApiKey trims whitespace', () => {
    setBodsApiKey('  key-with-spaces  ');
    const key = getBodsApiKey();
    expect(key).toBe('key-with-spaces');
  });

  test('setBodsApiKey rejects empty string', () => {
    expect(() => setBodsApiKey('')).toThrow('API key cannot be empty');
  });

  test('setBodsApiKey rejects whitespace-only string', () => {
    expect(() => setBodsApiKey('   ')).toThrow('API key cannot be empty');
  });

  test('getBodsApiKey returns undefined when no config', () => {
    cleanupTestConfig();
    const key = getBodsApiKey();
    expect(key).toBeUndefined();
  });
});
