import {TestCase} from 'vitest/node';
import {DotReporter} from 'vitest/reporters';

export default class extends DotReporter {
  assertions: number = 0;
  async onTestCaseResult(testCase: TestCase) {
    this.assertions += (testCase.meta() as any).assertions || 0;
    super.onTestCaseResult(testCase);
  }

  async onFinished() {
    super.onFinished();
    this.ctx.logger.log(`\nTotal Assertions: ${this.assertions}`);
  }
}
