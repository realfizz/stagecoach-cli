interface NaptanStop {
  AtcoCode: string;
  StopCode: string;
  Name: string;
  CommonName: string;
  Street: string;
  Indicator: string;
  Bearing: string;
  Locality: string;
  ParentLocalityName: string;
  Latitude: number;
  Longitude: number;
  StopType: string;
  TimingStatus: string;
  Status: string;
}

const NAPTAN_API_BASE = 'https://naptan.api.dft.gov.uk';

function extractMatches(xml: string, regex: RegExp): string[] {
  const matches: string[] = [];
  for (const match of xml.matchAll(regex)) {
    matches.push(match[1] || '');
  }
  return matches;
}

function parseXmlStops(xml: string): NaptanStop[] {
  const stops: NaptanStop[] = [];
  const stopRegex = /<StopAtcoCode>([^<]+)<\/StopAtcoCode>/g;
  const nameRegex = /<StopName>(?:<Text[^>]*>([^<]+)<\/Text>)?<\/StopName>/g;
  const commonNameRegex = /<CommonName>([^<]+)<\/CommonName>/g;
  const streetRegex = /<Street>([^<]*)<\/Street>/g;
  const indicatorRegex = /<Indicator>([^<]*)<\/Indicator>/g;
  const latRegex = /<Latitude>([^<]+)<\/Latitude>/g;
  const lonRegex = /<Longitude>([^<]+)<\/Longitude>/g;

  const atcoCodes = extractMatches(xml, stopRegex);
  const names = extractMatches(xml, nameRegex);
  const commonNames = extractMatches(xml, commonNameRegex);
  const streets = extractMatches(xml, streetRegex);
  const indicators = extractMatches(xml, indicatorRegex);
  const lats = extractMatches(xml, latRegex);
  const lons = extractMatches(xml, lonRegex);

  for (let i = 0; i < Math.min(atcoCodes.length, 10); i++) {
    stops.push({
      AtcoCode: atcoCodes[i] || '',
      StopCode: atcoCodes[i] || '',
      Name: names[i] || commonNames[i] || '',
      CommonName: commonNames[i] || '',
      Street: streets[i] || '',
      Indicator: indicators[i] || '',
      Bearing: '',
      Locality: '',
      ParentLocalityName: '',
      Latitude: Number(lats[i]) || 0,
      Longitude: Number(lons[i]) || 0,
      StopType: 'BusStop',
      TimingStatus: '',
      Status: 'Active',
    });
  }

  return stops;
}

export async function searchStopsByName(query: string): Promise<NaptanStop[]> {
  const url = `${NAPTAN_API_BASE}/v1/access-nodes?query=${encodeURIComponent(query)}&dataFormat=xml`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`NaPTAN API error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    return parseXmlStops(xml);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getStopByCode(code: string): Promise<NaptanStop | null> {
  const url = `${NAPTAN_API_BASE}/v1/access-nodes/${encodeURIComponent(code)}?dataFormat=xml`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`NaPTAN API error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const stops = parseXmlStops(xml);
    return stops[0] || null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchStopsByProximity(lat: number, lon: number, radiusMeters = 1000): Promise<NaptanStop[]> {
  const url = `${NAPTAN_API_BASE}/v1/access-nodes?lat=${lat}&lon=${lon}&radius=${radiusMeters}&dataFormat=xml`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`NaPTAN API error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    return parseXmlStops(xml);
  } finally {
    clearTimeout(timeout);
  }
}

export function isNaPTANCode(input: string): boolean {
  // NaPTAN codes are typically alphanumeric, e.g., 490008621A
  return /^[0-9]{8}[A-Z]$/.test(input) || /^[0-9]{8,12}$/.test(input);
}

export function isCoordinates(input: string): boolean {
  // Coordinates format: lat,lon
  return /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(input);
}

export function parseCoordinates(input: string): { lat: number; lon: number } {
  const parts = input.split(',');
  const lat = Number(parts[0]) || 0;
  const lon = Number(parts[1]) || 0;
  return { lat, lon };
}

export type { NaptanStop };
