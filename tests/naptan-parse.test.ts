import { describe, expect, test } from 'bun:test';
import { haversineDistance, isCoordinates, isNaPTANCode, parseCoordinates, parseNaPTANCsv } from '~/api/naptan.js';

describe('parseCoordinates', () => {
  test('valid "lat,lon" string with decimal', () => {
    expect(parseCoordinates('51.752,-1.257')).toEqual({ lat: 51.752, lon: -1.257 });
  });

  test('valid integer coordinates', () => {
    expect(parseCoordinates('51,-1')).toEqual({ lat: 51, lon: -1 });
  });

  test('valid negative latitude, positive longitude', () => {
    expect(parseCoordinates('-33.8688,151.2093')).toEqual({ lat: -33.8688, lon: 151.2093 });
  });

  test('returns null for "invalid"', () => {
    expect(parseCoordinates('invalid')).toBeNull();
  });

  test('returns null for non-numeric parts ("51.752,abc")', () => {
    expect(parseCoordinates('51.752,abc')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(parseCoordinates('')).toBeNull();
  });

  test('returns null when comma missing', () => {
    expect(parseCoordinates('51.752')).toBeNull();
  });

  test('returns null for two commas (extra parts)', () => {
    expect(parseCoordinates('1,2,3')).toBeNull();
  });

  test('returns null for whitespace-only', () => {
    expect(parseCoordinates('   ')).toBeNull();
  });
});

describe('isNaPTANCode', () => {
  test('"490008621A" is a valid NaPTAN code', () => {
    expect(isNaPTANCode('490008621A')).toBe(true);
  });

  test('8-digit code is valid', () => {
    expect(isNaPTANCode('49000862')).toBe(true);
  });

  test('12-digit code is valid', () => {
    expect(isNaPTANCode('490008621001')).toBe(true);
  });

  test('"abc" is not a valid NaPTAN code', () => {
    expect(isNaPTANCode('abc')).toBe(false);
  });

  test('"490008621a" (lowercase) is not valid', () => {
    expect(isNaPTANCode('490008621a')).toBe(false);
  });

  test('empty string is not valid', () => {
    expect(isNaPTANCode('')).toBe(false);
  });

  test('string with letters in middle is not valid', () => {
    expect(isNaPTANCode('49000A62')).toBe(false);
  });
});

describe('isCoordinates', () => {
  test('"51.752,-1.257" is coordinates', () => {
    expect(isCoordinates('51.752,-1.257')).toBe(true);
  });

  test('"foo" is not coordinates', () => {
    expect(isCoordinates('foo')).toBe(false);
  });

  test('integer pair is coordinates', () => {
    expect(isCoordinates('51,-1')).toBe(true);
  });

  test('empty string is not coordinates', () => {
    expect(isCoordinates('')).toBe(false);
  });

  test('missing comma is not coordinates', () => {
    expect(isCoordinates('51.752')).toBe(false);
  });

  test('letters in both parts is not coordinates', () => {
    expect(isCoordinates('abc,def')).toBe(false);
  });
});

describe('haversineDistance', () => {
  test('distance between 51.5,-0.1 and 51.6,-0.1 is ~11.1 km', () => {
    const distance = haversineDistance(51.5, -0.1, 51.6, -0.1);
    expect(distance).toBeCloseTo(11.119, 1);
  });

  test('distance of a point to itself is 0', () => {
    expect(haversineDistance(51.5, -0.1, 51.5, -0.1)).toBe(0);
  });

  test('distance is symmetric', () => {
    const ab = haversineDistance(51.5, -0.1, 51.6, -0.1);
    const ba = haversineDistance(51.6, -0.1, 51.5, -0.1);
    expect(ab).toBeCloseTo(ba, 10);
  });

  test('distance between London and Paris is ~344 km', () => {
    const distance = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distance).toBeGreaterThan(330);
    expect(distance).toBeLessThan(360);
  });
});

describe('parseNaPTANCsv', () => {
  const HEADER = 'ATCOCode,NaptanCode,CommonName,Street,Indicator,Bearing,LocalityName,ParentLocalityName,Town,Longitude,Latitude,StopType,BusStopType,TimingStatus,Status,AdministrativeAreaCode';

  test('parses simple CSV (no quotes) with 3 fields', () => {
    const csv = `${HEADER}\n490008621A,nbotdpw,Stop Name,Street,Indicator,N,Locality,Parent,Town,-1.257,51.752,BCT,MKD,OTH,active,082`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(1);
    const first = result[0];
    expect(first?.AtcoCode).toBe('490008621A');
    expect(first?.CommonName).toBe('Stop Name');
    expect(first?.Street).toBe('Street');
    expect(first?.Indicator).toBe('Indicator');
    expect(first?.Bearing).toBe('N');
    expect(first?.LocalityName).toBe('Locality');
    expect(first?.Town).toBe('Town');
    expect(first?.Latitude).toBe(51.752);
    expect(first?.Longitude).toBe(-1.257);
    expect(first?.StopType).toBe('BCT');
    expect(first?.Status).toBe('active');
  });

  test('handles quoted field with embedded comma', () => {
    const csv = `${HEADER}\n490008621A,,"Foo, Bar",Stop,"Street, Suburb",,,,,-1.257,51.752,BCT,,,active,`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]?.CommonName).toBe('Foo, Bar');
    expect(result[0]?.Street).toBe('Stop');
    expect(result[0]?.Indicator).toBe('Street, Suburb');
  });

  test('handles quoted field with embedded newline', () => {
    const csv = `${HEADER}\n490008621A,,"Line1\nLine2",Street,,,,,, -1.257,51.752,BCT,,,active,`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]?.CommonName).toBe('Line1\nLine2');
  });

  test('handles escaped quote inside quoted field', () => {
    const csv = `${HEADER}\n490008621A,,"He said ""hi""",Street,,,,,,-1.257,51.752,BCT,,,active,`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]?.CommonName).toBe('He said "hi"');
  });

  test('handles empty fields (,,)', () => {
    const csv = `${HEADER}\n490008621A,,,,,,,,,51.752,-1.257,BCT,,,active,`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]?.CommonName).toBe('');
    expect(result[0]?.Street).toBe('');
  });

  test('handles CRLF line endings', () => {
    const csv = `${HEADER}\r\n490008621A,,Stop A,Street,,,,,,-1.257,51.752,BCT,,,active,\r\n490008622B,,Stop B,Street 2,,,,,,-1.258,51.753,BCT,,,active,\r\n`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(2);
    expect(result[0]?.AtcoCode).toBe('490008621A');
    expect(result[1]?.AtcoCode).toBe('490008622B');
  });

  test('returns empty array for header-only input', () => {
    expect(parseNaPTANCsv(HEADER)).toEqual([]);
  });

  test('returns empty array for empty input', () => {
    expect(parseNaPTANCsv('')).toEqual([]);
  });

  test('filters out non-bus stop types (e.g. RLY, MET, PLT)', () => {
    const csv = `${HEADER}\n490008621A,,Bus Stop,Street,,,,,,-1.257,51.752,BCT,,,active,\n490008622B,,Rail Station,Street 2,,,,,,-1.258,51.753,RLY,,,active,`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]?.CommonName).toBe('Bus Stop');
  });

  test('includes BCS and BST bus stop types', () => {
    const csv = `${HEADER}\n490008621A,,On Street,Street,,,,,,-1.257,51.752,BCS,,,active,\n490008622B,,Marker,Street 2,,,,,,-1.258,51.753,BST,,,active,`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(2);
  });

  test('skips inactive stops', () => {
    const csv = `${HEADER}\n490008621A,,Active Stop,Street,,,,,,-1.257,51.752,BCT,,,active,\n490008622B,,Deleted Stop,Street 2,,,,,,-1.258,51.753,BCT,,,deleted,`;
    const result = parseNaPTANCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0]?.CommonName).toBe('Active Stop');
  });

  test('parses large CSV with 10k rows efficiently', () => {
    const rows: string[] = [HEADER];
    for (let i = 0; i < 10_000; i++) {
      rows.push(`4900${String(i).padStart(7, '0')},,Stop ${i},Street ${i},,N,Locality,Parent,Town,-1.257,51.752,BCT,MKD,OTH,active,082`);
    }
    const csv = rows.join('\n');

    const start = performance.now();
    const result = parseNaPTANCsv(csv);
    const elapsed = performance.now() - start;

    expect(result).toHaveLength(10_000);
    expect(elapsed).toBeLessThan(2000);
  });
});
