import {createStore} from 'tinybase';
import {createRemotePersister} from 'tinybase/persisters/persister-remote';
import {afterEach, expect, test} from 'vitest';
import {pause} from '../common/other.ts';

let fetchWas = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchWas;
  fetchWas = globalThis.fetch;
});

test('omits If-None-Match until an etag has been seen', async () => {
  const inits: (RequestInit | undefined)[] = [];
  const requests: Request[] = [];
  fetchWas = globalThis.fetch;
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    inits.push(init);
    const request =
      input instanceof Request ? input : new Request(String(input), init);
    requests.push(request);
    return new Response(
      request.method == 'GET' ? '[{"pets":{"fido":{"species":"dog"}}},{}]' : '',
      {headers: request.method == 'GET' ? {ETag: 'etag1'} : {ETag: 'etag2'}},
    );
  }) as typeof fetch;

  const persister = createRemotePersister(
    createStore(),
    'http://example.com/load',
    'http://example.com/save',
    0.01,
  );
  await persister.load();
  await persister.startAutoLoad();
  await pause(20);
  await persister.stopAutoLoad();

  expect(requests[0].method).toBe('GET');
  expect(inits[0]?.headers).toBeUndefined();
  const headRequestIndex = requests.findIndex(
    (request) => request.method == 'HEAD',
  );
  expect(headRequestIndex).toBeGreaterThan(-1);
  expect(inits[headRequestIndex]?.headers).toEqual({'If-None-Match': 'etag1'});
});

test('loads changed content with the previously consumed etag', async () => {
  let content = '[{"pets":{"fido":{"species":"dog"}}},{}]';
  let etag = 'etag1';
  const requests: Request[] = [];
  fetchWas = globalThis.fetch;
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const request =
      input instanceof Request ? input : new Request(String(input), init);
    requests.push(request);
    if (request.method == 'HEAD') {
      return new Response('', {headers: {ETag: etag}});
    }
    const notModified = request.headers.get('If-None-Match') == etag;
    return new Response(notModified ? '' : content, {
      status: notModified ? 304 : 200,
      headers: {ETag: etag},
    });
  }) as typeof fetch;

  const store = createStore();
  const persister = createRemotePersister(
    store,
    'http://example.com/load',
    'http://example.com/save',
    0.01,
  );
  await persister.startAutoLoad();

  content = '[{"pets":{"fido":{"species":"cat"}}},{}]';
  etag = 'etag2';
  await pause(20);
  await persister.stopAutoLoad();

  expect(store.getCell('pets', 'fido', 'species')).toBe('cat');
  const headRequestIndex = requests.findIndex(
    (request) => request.method == 'HEAD',
  );
  expect(headRequestIndex).toBeGreaterThan(-1);
  expect(requests[headRequestIndex + 1].headers.get('If-None-Match')).toBe(
    'etag1',
  );
});
