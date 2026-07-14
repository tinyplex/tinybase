import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {expect, test} from 'vitest';

class MockWebSocket {
  OPEN = 1;
  readyState = this.OPEN;
  sentPayloads: string[] = [];
  closeCalls = 0;
  readonly #listeners: {[event: string]: ((event: any) => void)[]} = {};

  addEventListener(event: string, listener: (event: any) => void): void {
    (this.#listeners[event] ??= []).push(listener);
  }

  removeEventListener(event: string, listener: (event: any) => void): void {
    this.#listeners[event] = (this.#listeners[event] ?? []).filter(
      (testListener) => testListener != listener,
    );
  }

  send(payload: string): void {
    this.sentPayloads.push(payload);
    const [toClientId, remainder] = splitPayload(payload);
    if (toClientId == 'S') {
      const [requestId, message, controlAndBody] = JSON.parse(remainder);
      if (message == -1 && controlAndBody[0] != 2) {
        queueMicrotask(() =>
          this.receive(
            'S\n' + JSON.stringify([requestId, message, controlAndBody]),
          ),
        );
      }
    }
  }

  receive(payload: string): void {
    this.#listeners.message?.forEach((listener) => listener({data: payload}));
  }

  close(): void {
    this.closeCalls++;
    this.readyState = 3;
  }
}

const splitPayload = (payload: string): [string, string] => {
  const splitAt = payload.indexOf('\n');
  return [payload.slice(0, splitAt), payload.slice(splitAt + 1)];
};

test('multiple stores share one WebSocket', async () => {
  const webSocket = new MockWebSocket();
  const filesReceives: any[] = [];
  const editorReceives: any[] = [];
  const filesSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
    1,
    undefined,
    (...args) => filesReceives.push(args),
  );
  const editorSynchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'editor',
    1,
    undefined,
    (...args) => editorReceives.push(args),
  );

  await filesSynchronizer.startSync();
  await editorSynchronizer.startSync();

  expect(
    webSocket.sentPayloads.some((payload) => payload.startsWith('M\nfiles\n')),
  ).toBe(true);
  expect(
    webSocket.sentPayloads.some((payload) => payload.startsWith('M\neditor\n')),
  ).toBe(true);

  webSocket.receive('M\nfiles\nremote\n[null,99,null]');
  expect(filesReceives).toEqual([['remote', null, 99, null]]);
  expect(editorReceives).toEqual([]);

  await filesSynchronizer.destroy();
  expect(webSocket.closeCalls).toBe(0);
  expect(webSocket.sentPayloads.at(-1)).toContain('-1,[2,"files"]]');

  await editorSynchronizer.destroy();
  expect(webSocket.closeCalls).toBe(1);
});

test('multiple channel Ids are validated and unique', async () => {
  const webSocket = new MockWebSocket();
  const synchronizer = await createWsSynchronizer(
    createMergeableStore(),
    webSocket as any,
    'files',
  );

  await expect(
    createWsSynchronizer(createMergeableStore(), webSocket as any, 'files'),
  ).rejects.toThrow('Duplicate multiplex channel Id: files');
  await expect(
    createWsSynchronizer(createMergeableStore(), webSocket as any, '../files'),
  ).rejects.toThrow('Invalid multiplex channel Id: ../files');

  await synchronizer.destroy();
  expect(webSocket.closeCalls).toBe(1);
});
