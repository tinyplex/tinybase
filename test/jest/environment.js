import {TextDecoder, TextEncoder} from 'util';
import {TestEnvironment} from 'jest-environment-jsdom';

export default class extends TestEnvironment {
  static assertionCalls = 0;
  async setup() {
    Object.assign(this.global, {
      TextDecoder,
      TextEncoder,
      Uint8Array,
      env: this.constructor,
      structuredClone,
    });
    await super.setup();
  }
}
