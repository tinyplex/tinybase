import {expectedElement, getServerFunctions} from './common';

const [startServer, stopServer, expectPage] = getServerFunctions(8800);

beforeAll(startServer);
afterAll(stopServer);

describe('Home', () => {
  test('Homepage loads', async () => {
    await expectPage('/');
    await expectedElement('title', 'TinyBase');
  });
});
