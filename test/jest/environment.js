import {TextDecoder, TextEncoder} from 'util';
import {BroadcastChannel} from 'worker_threads';
import {TestEnvironment} from 'jest-environment-jsdom';

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
    });
    await super.setup();
  }
}
