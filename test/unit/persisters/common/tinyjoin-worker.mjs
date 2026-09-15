// Emulates a dedicated Worker scope over a Node worker thread, and initializes
// TinyJoin's engine from disk, since its own loader fetches a URL relative to
// itself. Replace with TinyJoin's public Node entry point once it has one.
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {parentPort} from 'node:worker_threads';

const tinyJoinDir = dirname(
  createRequire(import.meta.url).resolve('tinyjoin/package.json'),
);
const wasm = await import(
  pathToFileURL(join(tinyJoinDir, 'wasm', 'tinyjoin_wasm.js')).href
);
await wasm.default({
  module_or_path: readFileSync(
    join(tinyJoinDir, 'wasm', 'tinyjoin_wasm_bg.wasm'),
  ),
});

const listeners = new Set();
globalThis.postMessage = (message) => parentPort.postMessage(message);
globalThis.addEventListener = (type, listener) =>
  type == 'message' ? listeners.add(listener) : 0;
globalThis.removeEventListener = (type, listener) =>
  type == 'message' ? listeners.delete(listener) : 0;
globalThis.close = () => process.exit(0);
parentPort.on('message', (data) =>
  [...listeners].forEach((listener) => listener({data})),
);

const {startWorker} = await import('tinyjoin/worker');
startWorker();
