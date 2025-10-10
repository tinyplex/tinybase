import {readFileSync} from 'fs';
import {fsa} from 'memfs/lib/fsa/index.js';
import {afterEach, beforeAll, expect, vi} from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const opfs = fsa({mode: 'readwrite'});

beforeAll(() => {
  const global = globalThis as any;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.navigator.storage = {getDirectory: () => opfs.dir};
  global.FileSystemObserver = opfs.FileSystemObserver;

  mockFetches();
});

afterEach(({task}) => {
  (task.meta as any).assertions = expect.getState().assertionCalls;
});

const mockFetches = () => {
  const fetchMock = createFetchMock(vi);
  fetchMock.enableMocks();
  fetchMock.resetMocks();
  fetchMock.doMock(async (request) => {
    if (request.url.startsWith('file://')) {
      return {
        status: 200,
        body: readFileSync(request.url.substring(7)) as any,
      };
    }
    if (request.url == 'wa-sqlite-async.wasm') {
      return {
        status: 200,
        body: readFileSync('node_modules/wa-sqlite/dist/' + request.url) as any,
      };
    }
    return '';
  });
};
