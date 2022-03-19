// eslint-disable-next-line @typescript-eslint/no-var-requires
import env from './environment.js';
import {writeFileSync} from 'fs';

export default class {
  onRunComplete(_contexts, results) {
    writeFileSync(
      './tmp/assertion-summary.json',
      JSON.stringify({
        tests: results.numTotalTests,
        assertions: env.assertionCalls,
      }),
      'utf-8',
    );
    // eslint-disable-next-line no-console
    console.log('Assertions: ', env.assertionCalls, '\n');
  }
}
