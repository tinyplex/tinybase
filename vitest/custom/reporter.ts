import {TestCase} from 'vitest/node';
import {DefaultReporter} from 'vitest/reporters';

export default class extends DefaultReporter {
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
