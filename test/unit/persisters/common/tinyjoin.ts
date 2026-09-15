import {resolve} from 'node:path';
import {Worker} from 'node:worker_threads';
import {type Client, create} from 'tinyjoin';

// Vitest serves this module over http, so `import.meta.url` cannot locate the
// Worker entry point; tests run from the repository root.
const WORKER_PATH = resolve('test/unit/persisters/common/tinyjoin-worker.mjs');

type Listener = (event: {data: unknown}) => void;

export type TinyJoinClientAndName = [
  client: Client,
  close: () => Promise<void>,
  name: string,
];

// Storage is always in-memory: OPFS needs a real browser.
export const getTinyJoinClient = async (): Promise<
  [client: Client, close: () => Promise<void>]
> => {
  const worker = new Worker(WORKER_PATH);
  const nodeListeners = new Map<Listener, (data: unknown) => void>();
  const client = await create({
    worker: {
      postMessage: (message: unknown) => worker.postMessage(message),
      addEventListener: (type: string, listener: any) => {
        if (type == 'message') {
          const nodeListener = (data: unknown) => listener({data});
          nodeListeners.set(listener, nodeListener);
          worker.on('message', nodeListener);
        } else if (type == 'error') {
          worker.on('error', listener);
        }
      },
      removeEventListener: (type: string, listener: any) => {
        if (type == 'message') {
          const nodeListener = nodeListeners.get(listener);
          if (nodeListener) {
            worker.off('message', nodeListener);
            nodeListeners.delete(listener);
          }
        } else if (type == 'error') {
          worker.off('error', listener);
        }
      },
      terminate: () => void worker.terminate(),
    } as any,
  });
  return [
    client,
    async () => {
      await client.close();
      await worker.terminate();
    },
  ];
};
