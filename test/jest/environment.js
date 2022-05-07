import {TestEnvironment} from 'jest-environment-jsdom';

export default class extends TestEnvironment {
  static assertionCalls = 0;
  async setup() {
    this.global.env = this.constructor;
    await super.setup();
  }
}
