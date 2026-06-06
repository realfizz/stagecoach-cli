import { describe, expect, test } from 'bun:test';
import { formatVehicles } from '~/commands/live.js';
import type { VehicleLocation } from '~/types.js';

describe('formatVehicles', () => {
  test('includes vehicle label in header', () => {
    const output = formatVehicles([], 'near 51.75,-1.25');
    expect(output).toContain('Vehicles near 51.75,-1.25:');
  });

  test('includes latitude, longitude, vehicleRef, and lineRef', () => {
    const vehicle: VehicleLocation = {
      vehicleRef: 'BUS-001',
      lineRef: '101',
      publishedLineName: '101',
      operatorRef: 'STCO',
      originRef: '0100',
      originName: 'Origin Stop',
      destinationRef: '0200',
      destinationName: 'Dest Stop',
      latitude: 51.752,
      longitude: -1.257,
      bearing: 180,
      monitored: true,
      recordedAt: '2024-01-01T12:00:00Z',
    };

    const output = formatVehicles([vehicle], 'on route 101');

    expect(output).toContain('Vehicles on route 101:');
    expect(output).toContain('BUS-001');
    expect(output).toContain('101');
    expect(output).toContain('51.752');
    expect(output).toContain('-1.257');
    expect(output).toContain('Origin Stop');
    expect(output).toContain('Dest Stop');
    expect(output).toContain('STCO');
  });

  test('handles multiple vehicles', () => {
    const vehicle1: VehicleLocation = {
      vehicleRef: 'V1',
      lineRef: '1',
      publishedLineName: '1',
      operatorRef: 'OP1',
      originRef: '',
      originName: 'A',
      destinationRef: '',
      destinationName: 'B',
      latitude: 51.0,
      longitude: -1.0,
      bearing: 0,
      monitored: true,
      recordedAt: '',
    };
    const vehicle2: VehicleLocation = { ...vehicle1, vehicleRef: 'V2', lineRef: '2' };

    const output = formatVehicles([vehicle1, vehicle2], 'test');

    expect(output).toContain('V1');
    expect(output).toContain('V2');
  });
});
