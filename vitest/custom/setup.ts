import {readFileSync} from 'fs';
import {fsa} from 'memfs/lib/fsa/index.js';
import {afterEach, beforeAll, beforeEach, expect, vi} from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

const opfs = fsa({mode: 'readwrite'});

beforeAll(() => {
  const global = globalThis as any;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.navigator.storage = {getDirectory: () => opfs.dir};
  global.FileSystemObserver = opfs.FileSystemObserver;

  fetchMock.enableMocks();
});

beforeEach(() => {
  fetchMock.resetMocks();
  mockWasmFetches();
});

afterEach(({task}) => {
  (task.meta as any).assertions = expect.getState().assertionCalls;
});

const mockWasmFetches = () => {
  fetchMock.resetMocks();
  fetchMock.doMock(async (request) => {
    if (request.url.startsWith('file://')) {
      return {
        status: 200,
        body: readFileSync(request.url.substring(7)) as any,
      };
    }
    return '';
  });
};
