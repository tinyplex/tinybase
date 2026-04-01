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
