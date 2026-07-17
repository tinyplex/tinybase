import {createStore} from 'tinybase';
import {createRemotePersister} from 'tinybase/persisters/persister-remote';
import {afterEach, expect, test, vi} from 'vitest';
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

test('reuses the last content for a not-modified response', async () => {
  let getCount = 0;
  const ignoredError = vi.fn();
  fetchWas = globalThis.fetch;
  globalThis.fetch = (async (
    _input: RequestInfo | URL,
    _init?: RequestInit,
  ): Promise<Response> =>
    getCount++
      ? new Response(null, {status: 304, headers: {ETag: 'etag1'}})
      : new Response('[{"pets":{"fido":{"species":"dog"}}},{}]', {
          headers: {ETag: 'etag1'},
        })) as typeof fetch;

  const store = createStore();
  const persister = createRemotePersister(
    store,
    'http://example.com/load',
    'http://example.com/save',
    5,
    ignoredError,
  );
  await persister.load();
  store.setCell('pets', 'fido', 'species', 'cat');
  await persister.load([{fallback: {row: {cell: 1}}}, {}]);

  expect(store.getContent()).toEqual([{pets: {fido: {species: 'dog'}}}, {}]);
  expect(ignoredError).not.toHaveBeenCalled();
  await persister.destroy();
});

test('reports a not-modified response without cached content', async () => {
  const response = new Response(null, {status: 304});
  const ignoredError = vi.fn();
  fetchWas = globalThis.fetch;
  globalThis.fetch = (async (
    _input: RequestInfo | URL,
    _init?: RequestInit,
  ): Promise<Response> => response) as typeof fetch;
  const store = createStore();
  const persister = createRemotePersister(
    store,
    'http://example.com/load',
    'http://example.com/save',
    5,
    ignoredError,
  );

  await persister.load([{fallback: {row: {cell: 1}}}, {}]);

  expect(store.getContent()).toEqual([{fallback: {row: {cell: 1}}}, {}]);
  expect(ignoredError).toHaveBeenCalledWith(response);
  await persister.destroy();
});

test('reports unsuccessful load and save responses', async () => {
  const responses: Response[] = [];
  const ignoredError = vi.fn();
  fetchWas = globalThis.fetch;
  globalThis.fetch = (async (
    _input: RequestInfo | URL,
    _init?: RequestInit,
  ): Promise<Response> => {
    const response = new Response('[{},{}]', {status: 503});
    responses.push(response);
    return response;
  }) as typeof fetch;

  const store = createStore().setValue('species', 'dog');
  const persister = createRemotePersister(
    store,
    'http://example.com/load',
    'http://example.com/save',
    5,
    ignoredError,
  );
  await persister.load();
  await persister.save();

  expect(store.getValues()).toEqual({species: 'dog'});
  expect(ignoredError).toHaveBeenNthCalledWith(1, responses[0]);
  expect(ignoredError).toHaveBeenNthCalledWith(2, responses[1]);
  await persister.destroy();
});

test('serializes polling until changed content has loaded', async () => {
  let getCount = 0;
  let headCount = 0;
  let releaseChangedGet = () => {};
  let markChangedGetStarted = () => {};
  const changedGetGate = new Promise<void>(
    (resolve) => (releaseChangedGet = resolve),
  );
  const changedGetStarted = new Promise<void>(
    (resolve) => (markChangedGetStarted = resolve),
  );
  fetchWas = globalThis.fetch;
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const request =
      input instanceof Request ? input : new Request(String(input), init);
    if (request.method == 'HEAD') {
      headCount++;
      return new Response(null, {headers: {ETag: 'etag2'}});
    }
    if (!getCount++) {
      return new Response('[{"pets":{"fido":{"species":"dog"}}},{}]', {
        headers: {ETag: 'etag1'},
      });
    }
    markChangedGetStarted();
    await changedGetGate;
    return new Response('[{"pets":{"fido":{"species":"cat"}}},{}]', {
      headers: {ETag: 'etag2'},
    });
  }) as typeof fetch;

  const store = createStore();
  const persister = createRemotePersister(
    store,
    'http://example.com/load',
    'http://example.com/save',
    0.005,
  );
  await persister.startAutoLoad();
  await changedGetStarted;
  await pause(20);

  expect(headCount).toBe(1);
  releaseChangedGet();
  await persister.schedule(async () => {});
  await persister.stopAutoLoad();
  expect(store.getCell('pets', 'fido', 'species')).toBe('cat');
  await persister.destroy();
});

test('stops before a pending poll can load', async () => {
  let getCount = 0;
  let markHeadStarted = () => {};
  let releaseHead = () => {};
  const headStarted = new Promise<void>(
    (resolve) => (markHeadStarted = resolve),
  );
  const headGate = new Promise<void>((resolve) => (releaseHead = resolve));
  fetchWas = globalThis.fetch;
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const request =
      input instanceof Request ? input : new Request(String(input), init);
    if (request.method == 'HEAD') {
      markHeadStarted();
      await headGate;
      return new Response(null, {headers: {ETag: 'etag2'}});
    }
    getCount++;
    return new Response('[{"pets":{"fido":{"species":"dog"}}},{}]', {
      headers: {ETag: 'etag1'},
    });
  }) as typeof fetch;

  const store = createStore();
  const persister = createRemotePersister(
    store,
    'http://example.com/load',
    'http://example.com/save',
    0.005,
  );
  await persister.startAutoLoad();
  await headStarted;
  const stopped = persister.stopAutoLoad();
  releaseHead();
  await stopped;
  await pause(10);

  expect(getCount).toBe(1);
  expect(store.getCell('pets', 'fido', 'species')).toBe('dog');
  await persister.destroy();
});

test('reports polling failures when the error handler throws', async () => {
  const pollError = new Error('poll failed');
  const handlerError = new Error('handler failed');
  const failedResponse = new Response(null, {status: 503});
  let headCount = 0;
  let markErrorReported = () => {};
  const errorReported = new Promise<void>(
    (resolve) => (markErrorReported = resolve),
  );
  const ignoredError = vi.fn((error) => {
    if (error == pollError) {
      markErrorReported();
    }
    throw handlerError;
  });
  fetchWas = globalThis.fetch;
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const request =
      input instanceof Request ? input : new Request(String(input), init);
    if (request.method == 'HEAD') {
      if (!headCount++) {
        return failedResponse;
      }
      throw pollError;
    }
    return new Response('[{},{}]', {headers: {ETag: 'etag1'}});
  }) as typeof fetch;

  const persister = createRemotePersister(
    createStore(),
    'http://example.com/load',
    'http://example.com/save',
    0.005,
    ignoredError,
  );
  await persister.startAutoLoad();
  await errorReported;
  await persister.stopAutoLoad();

  expect(ignoredError).toHaveBeenCalledWith(failedResponse);
  expect(ignoredError).toHaveBeenCalledWith(pollError);
  await persister.destroy();
});
