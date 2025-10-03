import {writeFileSync} from 'fs';
import {TestEnvironment} from 'jest-environment-jsdom';
import {fsa} from 'memfs/lib/fsa/index.js';
import {TextDecoder, TextEncoder} from 'util';
import {BroadcastChannel} from 'worker_threads';

export default class TinyBaseEnvironment extends TestEnvironment {
  static tests = 0;
  static assertions = 0;

  async setup() {
    Object.assign(this.global, {
      TextDecoder,
      TextEncoder,
      Uint8Array,
      Request,
      env: this.constructor,
      structuredClone,
      BroadcastChannel,
      setImmediate,
      clearImmediate,
    });
    this.global.navigator.storage = {
      getDirectory: () => fsa({mode: 'readwrite'}).dir,
    };
    await super.setup();
  }

  async teardown() {
    writeFileSync(
      './tmp/counts.json',
      JSON.stringify({
        tests: TinyBaseEnvironment.tests,
        assertions: TinyBaseEnvironment.assertions,
      }),
      'utf-8',
    );
    await super.teardown();
  }
}
