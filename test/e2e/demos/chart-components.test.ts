import {test} from '@playwright/test';
import {
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll, describe} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8812);

beforeAll(startServer);
afterAll(stopServer);

describe('chart-components', () => {
  test('Composing Charts', async ({page}) => {
    await expectPage(page, `/demos/chart-components-react/composing-charts/`);
    await expectedElement(page, 'h1', 'Composing Charts');
    await expectedFramedElement(page, 'svg.chart-lines .series-revenue .line');
    await expectedFramedElement(page, 'svg.chart-bars .series-orders .bar');
    await expectedFramedElement(page, 'svg.chart-mixed .series-revenue .line');
  });

  test('Sorting And Types', async ({page}) => {
    await expectPage(page, `/demos/chart-components-react/sorting-and-types/`);
    await expectedElement(page, 'h1', 'Sorting And Types');
    await expectedFramedElement(page, 'svg.chart-numbers .plot .line');
    await expectedFramedElement(page, 'svg.chart-categories .bar');
    await expectedFramedElement(
      page,
      'svg.chart-booleans .series-accounts .bar',
    );
    await expectedFramedElement(page, 'svg.chart-booleans text', 'true');
    await expectedFramedElement(page, 'svg.chart-booleans text', 'false');
  });
});
