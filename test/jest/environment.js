import {TestEnvironment} from 'jest-environment-jsdom';
import {TextDecoder, TextEncoder} from 'util';
import {BroadcastChannel} from 'worker_threads';

export default class extends TestEnvironment {
  static assertionCalls = 0;
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
    await super.setup();
  }
}
