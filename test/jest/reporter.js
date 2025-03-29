import {readFileSync} from 'fs';

export default class {
  onRunComplete() {
    const counts = JSON.parse(readFileSync('./tmp/counts.json', 'utf-8'));
    // eslint-disable-next-line no-console
    console.log(
      'Tests:',
      counts.tests,
      '\nAssertions:',
      counts.assertions,
      '\n',
    );
  }
}
