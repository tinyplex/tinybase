import {expect, test} from '@playwright/test';
import {getServerFunctions} from './common.ts';

const {beforeAll, afterAll, describe} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8800);

beforeAll(startServer);
afterAll(stopServer);

describe('Home', () => {
  test('Homepage loads', async ({page}) => {
    await expectPage(page, '/');
    await expect(page).toHaveTitle('TinyBase');
  });
});
