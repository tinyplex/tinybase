import {writeFile} from 'fs/promises';
import {
  SerializedError,
  TestCase,
  TestModule,
  TestRunEndReason,
} from 'vitest/node';
import {DefaultReporter} from 'vitest/reporters';

export default class extends DefaultReporter {
  tests: number = 0;
  assertions: number = 0;
  async onTestCaseResult(testCase: TestCase) {
    this.assertions += (testCase.meta() as any).assertions || 0;
    this.tests++;
    super.onTestCaseResult(testCase);
  }

  async onTestRunEnd(
    testModules: ReadonlyArray<TestModule>,
    unhandledErrors: ReadonlyArray<SerializedError>,
    reason: TestRunEndReason,
  ) {
    super.onTestRunEnd(testModules, unhandledErrors, reason);
    this.ctx.logger.log(`\nTotal Assertions: ${this.assertions}`);
    await writeFile(
      './tmp/counts.json',
      JSON.stringify({tests: this.tests, assertions: this.assertions}),
      'utf8',
    );
  }
}
