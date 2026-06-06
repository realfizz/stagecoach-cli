import type { Bearing, NaptanStop } from '~/types.js';

const NAPTAN_API_BASE = 'https://naptan.api.dft.gov.uk';
const NAPTAN_DOWNLOAD_TIMEOUT_MS = 120_000;
const NAPTAN_MAX_RESULTS = 20;
const EARTH_RADIUS_KM = 6371;
const DEG_TO_RAD = Math.PI / 180;
const BUS_STOP_TYPES = new Set(['BCT', 'BCS', 'BST']);

export function parseNaPTANCsv(csv: string): NaptanStop[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < csv.length) {
    const char = csv[i] ?? '';

    if (inQuotes) {
      if (char === '"') {
        if (csv[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += char;
        i++;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
    } else if (char === ',') {
      row.push(field);
      field = '';
      i++;
    } else if (char === '\n' || char === '\r') {
      const isBlankLine = field.trim() === '' && row.length === 0;
      if (!isBlankLine) {
        row.push(field);
        rows.push(row);
      }
      row = [];
      field = '';
      if (char === '\r' && csv[i + 1] === '\n') {
        i += 2;
      } else {
        i++;
      }
    } else {
      field += char;
      i++;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length < 2) return [];

  const header = rows[0] ?? [];
  const stops: NaptanStop[] = [];

  for (let r = 1; r < rows.length; r++) {
    const fields = rows[r];
    if (!fields) continue;

    const get = (name: string): string => {
      const idx = header.indexOf(name);
      return idx >= 0 ? (fields[idx] ?? '').trim() : '';
    };

    const status = get('Status');
    if (status && status.toLowerCase() !== 'active') continue;

    const stopType = get('StopType');
    if (stopType && !BUS_STOP_TYPES.has(stopType)) continue;

    const lon = Number(get('Longitude'));
    const lat = Number(get('Latitude'));

    stops.push({
      AtcoCode: get('ATCOCode'),
      NaptanCode: get('NaptanCode'),
      CommonName: get('CommonName'),
      Street: get('Street'),
      Indicator: get('Indicator'),
      Bearing: get('Bearing') as Bearing,
      LocalityName: get('LocalityName'),
      ParentLocalityName: get('ParentLocalityName'),
      Town: get('Town'),
      Longitude: Number.isFinite(lon) ? lon : null,
      Latitude: Number.isFinite(lat) ? lat : null,
      StopType: stopType,
      BusStopType: get('BusStopType'),
      TimingStatus: get('TimingStatus'),
      Status: status,
      AdministrativeAreaCode: get('AdministrativeAreaCode'),
    });
  }

  return stops;
}

let stopsCache: NaptanStop[] = [];
let cachePromise: Promise<NaptanStop[]> | null = null;

async function downloadAllStops(): Promise<NaptanStop[]> {
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const url = `${NAPTAN_API_BASE}/v1/access-nodes?dataFormat=csv`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), NAPTAN_DOWNLOAD_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`NaPTAN API error: ${response.status} ${response.statusText}`);
      }
      const csv = await response.text();
      stopsCache = parseNaPTANCsv(csv);
      return stopsCache;
    } catch (err) {
      stopsCache = [];
      cachePromise = null;
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  })();

  return cachePromise;
}

export async function searchStopsByName(query: string): Promise<NaptanStop[]> {
  const stops = await downloadAllStops();
  const lowerQuery = query.toLowerCase();
  return stops
    .filter((stop) => {
      const name = (stop.CommonName || '').toLowerCase();
      const street = (stop.Street || '').toLowerCase();
      const town = (stop.Town || '').toLowerCase();
      const locality = (stop.LocalityName || '').toLowerCase();
      return name.includes(lowerQuery) || street.includes(lowerQuery) || town.includes(lowerQuery) || locality.includes(lowerQuery);
    })
    .slice(0, NAPTAN_MAX_RESULTS);
}

export async function getStopByCode(code: string): Promise<NaptanStop | null> {
  if (stopsCache.length > 0) {
    const found = stopsCache.find((s) => s.AtcoCode === code || s.NaptanCode === code);
    if (found) return found;
  }

  const stops = await downloadAllStops();
  return stops.find((s) => s.AtcoCode === code || s.NaptanCode === code) || null;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => deg * DEG_TO_RAD;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export async function searchStopsByProximity(lat: number, lon: number, radiusKm = 1): Promise<NaptanStop[]> {
  const stops = await downloadAllStops();

  return stops
    .filter((stop) => {
      if (stop.Latitude == null || stop.Longitude == null) return false;
      return haversineDistance(lat, lon, stop.Latitude, stop.Longitude) <= radiusKm;
    })
    .sort((a, b) => {
      const distA = haversineDistance(lat, lon, a.Latitude ?? 0, a.Longitude ?? 0);
      const distB = haversineDistance(lat, lon, b.Latitude ?? 0, b.Longitude ?? 0);
      return distA - distB;
    })
    .slice(0, NAPTAN_MAX_RESULTS);
}

export function isNaPTANCode(input: string): boolean {
  return /^[0-9]{6,12}[A-Z]?$/.test(input);
}

export function isCoordinates(input: string): boolean {
  return /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(input);
}

export function parseCoordinates(input: string): { lat: number; lon: number } | null {
  const parts = input.split(',');
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}
