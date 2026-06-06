import { describe, expect, test } from 'bun:test';
import { isCoordinates, isNaPTANCode, parseCoordinates } from '~/api/naptan.js';

describe('isNaPTANCode', () => {
  test('valid 9-char code with letter', () => {
    expect(isNaPTANCode('490008621A')).toBe(true);
  });

  test('valid 8-digit code', () => {
    expect(isNaPTANCode('49000862')).toBe(true);
  });

  test('valid 12-digit code', () => {
    expect(isNaPTANCode('490008621001')).toBe(true);
  });

  test('invalid code with too few chars', () => {
    expect(isNaPTANCode('4900')).toBe(false);
  });

  test('invalid code with letters in middle', () => {
    expect(isNaPTANCode('49000A62')).toBe(false);
  });

  test('empty string', () => {
    expect(isNaPTANCode('')).toBe(false);
  });
});

describe('isCoordinates', () => {
  test('valid positive coordinates', () => {
    expect(isCoordinates('51.752,-1.257')).toBe(true);
  });

  test('valid negative coordinates', () => {
    expect(isCoordinates('-33.8688,151.2093')).toBe(true);
  });

  test('valid integer coordinates', () => {
    expect(isCoordinates('51,-1')).toBe(true);
  });

  test('invalid format - no comma', () => {
    expect(isCoordinates('51.752')).toBe(false);
  });

  test('invalid format - letters', () => {
    expect(isCoordinates('abc,def')).toBe(false);
  });

  test('empty string', () => {
    expect(isCoordinates('')).toBe(false);
  });
});

describe('parseCoordinates', () => {
  test('valid coordinates', () => {
    const result = parseCoordinates('51.752,-1.257');
    expect(result).toEqual({ lat: 51.752, lon: -1.257 });
  });

  test('negative coordinates', () => {
    const result = parseCoordinates('-33.8688,151.2093');
    expect(result).toEqual({ lat: -33.8688, lon: 151.2093 });
  });

  test('integer coordinates', () => {
    const result = parseCoordinates('51,-1');
    expect(result).toEqual({ lat: 51, lon: -1 });
  });

  test('invalid input - non-numeric', () => {
    const result = parseCoordinates('abc,def');
    expect(result).toBeNull();
  });

  test('invalid input - missing comma', () => {
    const result = parseCoordinates('51.752');
    expect(result).toBeNull();
  });

  test('invalid input - empty string', () => {
    const result = parseCoordinates('');
    expect(result).toBeNull();
  });
});
