import { getBodsApiKey } from '~/config.js';

const BODS_API_BASE = 'https://data.bus-data.dft.gov.uk';
const BODS_REQUEST_TIMEOUT_MS = 30_000;

export const BODS_DATASETS_PATH = '/api/v1/dataset/';
export const BODS_DATAFEED_PATH = '/api/v1/datafeed/';
export const BODS_FARES_PATH = '/api/v1/fares/dataset/';

export const BODS_DATASETS_LIMIT = 10;
export const BODS_OPERATORS_LIMIT = 100;
export const BODS_FARES_LIMIT = 20;

export interface BodsFetchOptions {
  path: string;
  params?: Record<string, string>;
}

export interface BodsResponse<T> {
  results: T[];
}

export async function resolveApiKey(): Promise<string> {
  const apiKey = getBodsApiKey();
  if (!apiKey) {
    throw new Error('BODS API key not configured. Run: stagecoach init');
  }
  return apiKey;
}

export function buildBodsUrl(path: string, apiKey: string, params: Record<string, string> = {}): URL {
  const url = new URL(path, BODS_API_BASE);
  url.searchParams.set('api_key', apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

export async function bodsRequest<T>({ path, params = {} }: BodsFetchOptions, consume: (response: Response) => T | Promise<T>): Promise<T> {
  const apiKey = await resolveApiKey();
  const url = buildBodsUrl(path, apiKey, params);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BODS_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`BODS API error: ${response.status} ${response.statusText}`);
    }
    return await consume(response);
  } finally {
    clearTimeout(timeout);
  }
}

export function bodsFetch<T>(options: BodsFetchOptions): Promise<T> {
  return bodsRequest(options, (response) => response.json() as Promise<T>);
}

export function bodsFetchText(options: BodsFetchOptions): Promise<string> {
  return bodsRequest(options, (response) => response.text());
}
