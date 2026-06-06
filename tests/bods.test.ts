import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { BODS_DATAFEED_PATH, BODS_DATASETS_LIMIT, BODS_DATASETS_PATH, BODS_FARES_LIMIT, BODS_FARES_PATH, BODS_OPERATORS_LIMIT, type BodsResponse, bodsFetch, bodsFetchText, bodsRequest, buildBodsUrl, resolveApiKey } from '~/api/bods.js';
import { cleanupTestConfig, setupIsolatedConfigDir, setupTestConfig } from '~~/tests/helpers.js';

setupIsolatedConfigDir('bods');

const originalFetch = globalThis.fetch;
const originalBodsKey = process.env.BODS_API_KEY;

function mockJsonResponse(status: number, body: unknown, statusText = 'OK'): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'content-type': 'application/json' },
  });
}

function mockTextResponse(status: number, body: string, statusText = 'OK'): Response {
  return new Response(body, {
    status,
    statusText,
    headers: { 'content-type': 'text/plain' },
  });
}

describe('buildBodsUrl', () => {
  test('combines base URL with path', () => {
    const url = buildBodsUrl(BODS_DATASETS_PATH, 'key');
    expect(url.origin).toBe('https://data.bus-data.dft.gov.uk');
    expect(url.pathname).toBe(BODS_DATASETS_PATH);
  });

  test('appends api_key as query parameter', () => {
    const url = buildBodsUrl(BODS_DATASETS_PATH, 'my-secret-key');
    expect(url.searchParams.get('api_key')).toBe('my-secret-key');
  });

  test('appends params from BODS_DATASETS_LIMIT (10)', () => {
    const url = buildBodsUrl(BODS_DATASETS_PATH, 'key', { limit: String(BODS_DATASETS_LIMIT), search: 'oxford' });
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.get('search')).toBe('oxford');
  });

  test('appends params from BODS_FARES_LIMIT (20)', () => {
    const url = buildBodsUrl(BODS_FARES_PATH, 'key', { limit: String(BODS_FARES_LIMIT), status: 'published' });
    expect(url.searchParams.get('limit')).toBe('20');
    expect(url.searchParams.get('status')).toBe('published');
  });

  test('appends params from BODS_OPERATORS_LIMIT (100)', () => {
    const url = buildBodsUrl(BODS_DATASETS_PATH, 'key', { limit: String(BODS_OPERATORS_LIMIT) });
    expect(url.searchParams.get('limit')).toBe('100');
  });

  test('uses BODS_DATAFEED_PATH for vehicle location lookups', () => {
    const url = buildBodsUrl(BODS_DATAFEED_PATH, 'key', { boundingBox: '0,0,1,1' });
    expect(url.pathname).toBe(BODS_DATAFEED_PATH);
    expect(url.searchParams.get('boundingBox')).toBe('0,0,1,1');
  });

  test('uses BODS_FARES_PATH for fare dataset lookups', () => {
    const url = buildBodsUrl(BODS_FARES_PATH, 'key');
    expect(url.pathname).toBe(BODS_FARES_PATH);
  });

  test('omits empty params object', () => {
    const url = buildBodsUrl(BODS_DATASETS_PATH, 'key');
    expect(url.search).toContain('api_key=key');
  });
});

describe('bodsRequest', () => {
  beforeEach(() => {
    setupTestConfig('test-api-key-123');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    cleanupTestConfig();
    if (originalBodsKey === undefined) {
      delete process.env.BODS_API_KEY;
    } else {
      process.env.BODS_API_KEY = originalBodsKey;
    }
  });

  test('returns parsed JSON on 200 response', async () => {
    const payload = { results: [{ id: 1, name: 'test' }] };
    const fetchMock = mock(async () => mockJsonResponse(200, payload));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await bodsFetch<BodsResponse<{ id: number; name: string }>>({ path: BODS_DATASETS_PATH });
    expect(result).toEqual(payload);
  });

  test('calls fetch with a URL that contains api_key', async () => {
    const capturedUrl: { current: URL | null } = { current: null };
    const fetchMock = mock(async (input: Parameters<typeof fetch>[0]) => {
      capturedUrl.current = new URL(input.toString());
      return mockJsonResponse(200, { results: [] });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await bodsFetch({ path: BODS_DATASETS_PATH });

    expect(capturedUrl.current).not.toBeNull();
    const url = capturedUrl.current;
    if (!url) throw new Error('expected URL');
    expect(url.searchParams.has('api_key')).toBe(true);
    expect(url.searchParams.get('api_key')).not.toBe('');
    expect(url.pathname).toBe(BODS_DATASETS_PATH);
    expect(url.origin).toBe('https://data.bus-data.dft.gov.uk');
  });

  test('appends custom params including limit from BODS_DATASETS_LIMIT', async () => {
    const capturedUrl: { current: URL | null } = { current: null };
    const fetchMock = mock(async (input: Parameters<typeof fetch>[0]) => {
      capturedUrl.current = new URL(input.toString());
      return mockJsonResponse(200, { results: [] });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await bodsFetch({
      path: BODS_DATASETS_PATH,
      params: { limit: String(BODS_DATASETS_LIMIT), search: 'oxford' },
    });

    const url = capturedUrl.current;
    if (!url) throw new Error('expected URL');
    expect(url.searchParams.get('limit')).toBe(String(BODS_DATASETS_LIMIT));
    expect(url.searchParams.get('search')).toBe('oxford');
  });

  test('uses BODS_FARES_PATH for fare endpoint', async () => {
    const capturedUrl: { current: URL | null } = { current: null };
    const fetchMock = mock(async (input: Parameters<typeof fetch>[0]) => {
      capturedUrl.current = new URL(input.toString());
      return mockJsonResponse(200, { results: [] });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await bodsFetch({
      path: BODS_FARES_PATH,
      params: { status: 'published', limit: String(BODS_FARES_LIMIT) },
    });

    const url = capturedUrl.current;
    if (!url) throw new Error('expected URL');
    expect(url.pathname).toBe(BODS_FARES_PATH);
    expect(url.searchParams.get('limit')).toBe(String(BODS_FARES_LIMIT));
  });

  test('uses BODS_DATAFEED_PATH for vehicle location endpoint', async () => {
    const capturedUrl: { current: URL | null } = { current: null };
    const fetchMock = mock(async (input: Parameters<typeof fetch>[0]) => {
      capturedUrl.current = new URL(input.toString());
      return mockTextResponse(200, '<Siri></Siri>');
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await bodsFetchText({
      path: BODS_DATAFEED_PATH,
      params: { boundingBox: '0,0,1,1' },
    });

    const url = capturedUrl.current;
    if (!url) throw new Error('expected URL');
    expect(url.pathname).toBe(BODS_DATAFEED_PATH);
    expect(url.searchParams.get('boundingBox')).toBe('0,0,1,1');
  });

  test('throws on 4xx response with status and statusText', async () => {
    const fetchMock = mock(async () => mockJsonResponse(401, { error: 'unauthorized' }, 'Unauthorized'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(bodsFetch({ path: BODS_DATASETS_PATH })).rejects.toThrow('BODS API error: 401 Unauthorized');
  });

  test('throws on 403 forbidden', async () => {
    const fetchMock = mock(async () => mockJsonResponse(403, { error: 'forbidden' }, 'Forbidden'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(bodsFetch({ path: BODS_DATASETS_PATH })).rejects.toThrow('BODS API error: 403 Forbidden');
  });

  test('throws on 5xx response', async () => {
    const fetchMock = mock(async () => mockJsonResponse(500, { error: 'internal' }, 'Internal Server Error'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(bodsFetch({ path: BODS_DATASETS_PATH })).rejects.toThrow('BODS API error: 500 Internal Server Error');
  });

  test('throws on 503 service unavailable', async () => {
    const fetchMock = mock(async () => mockJsonResponse(503, {}, 'Service Unavailable'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(bodsFetch({ path: BODS_DATASETS_PATH })).rejects.toThrow('BODS API error: 503 Service Unavailable');
  });

  test('throws on network error', async () => {
    const fetchMock = mock(async () => {
      throw new Error('Network connection lost');
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(bodsFetch({ path: BODS_DATASETS_PATH })).rejects.toThrow('Network connection lost');
  });

  test('throws on AbortController signal (timeout)', async () => {
    const fetchMock = mock((_input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        if (init?.signal) {
          init.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
          setTimeout(() => {
            init.signal?.dispatchEvent(new Event('abort'));
          }, 0);
        }
      });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(bodsFetch({ path: BODS_DATASETS_PATH })).rejects.toThrow('The operation was aborted');
  });

  test('passes an AbortSignal to fetch', async () => {
    let passedSignal: AbortSignal | null | undefined;
    const fetchMock = mock((_input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      passedSignal = init?.signal;
      return Promise.resolve(mockJsonResponse(200, { results: [] }));
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await bodsFetch({ path: BODS_DATASETS_PATH });

    expect(passedSignal).toBeInstanceOf(AbortSignal);
  });

  test('passes custom consume function for text responses', async () => {
    const xml = '<?xml version="1.0"?><Siri>hello</Siri>';
    const fetchMock = mock(async () => mockTextResponse(200, xml));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await bodsFetchText({ path: BODS_DATAFEED_PATH });
    expect(result).toBe(xml);
  });

  test('calls consume function with response object', async () => {
    const payload = { results: [{ id: 1 }] };
    const fetchMock = mock(async () => mockJsonResponse(200, payload));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    let consumed: unknown = null;
    await bodsRequest({ path: BODS_DATASETS_PATH }, (response) => {
      consumed = response;
      return Promise.resolve({ custom: true });
    });

    expect(consumed).not.toBeNull();
  });
});

describe('resolveApiKey', () => {
  afterEach(() => {
    if (originalBodsKey === undefined) {
      delete process.env.BODS_API_KEY;
    } else {
      process.env.BODS_API_KEY = originalBodsKey;
    }
    cleanupTestConfig();
  });

  test('returns a non-empty string when API key is configured', async () => {
    setupTestConfig('any-key-123');
    const key = await resolveApiKey();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });
});
