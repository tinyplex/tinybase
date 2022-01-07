// eslint-disable-next-line @typescript-eslint/no-var-requires
import JsDomEnvironment from 'jest-environment-jsdom';

export default class extends JsDomEnvironment {
  static assertionCalls = 0;
  async setup() {
    this.global.env = this.constructor;
    await super.setup();
  }
}
