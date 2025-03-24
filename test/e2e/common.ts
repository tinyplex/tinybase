import 'expect-puppeteer';
import 'jest-puppeteer';
import {ElementHandle} from 'puppeteer';
import {Server} from 'http';
// @ts-expect-error - no types for shared server
import {createTestServer} from '../server.mjs';

jest.setTimeout(10000);

let browserWarmed = false;

export const getServerFunctions = (
  port: number,
): [() => void, () => void, (path: string) => Promise<void>] => {
  const DOMAIN = `http://0.0.0.0:${port}`;

  let server: Server;

  const startServer = () => {
    server = createTestServer('docs', port, false);
  };

  const stopServer = () => {
    server.close();
  };

  const expectPage = async (path: string): Promise<void> => {
    if (!browserWarmed) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // ^ needed since Puppeteer 23.4.0
      browserWarmed = true;
    }
    await page.goto(`${DOMAIN}${path}`);
  };

  return [startServer, stopServer, expectPage];
};

export const expectedFramedElement = async (
  selector: string,
  text?: string | RegExp,
  timeout = 2000,
): Promise<ElementHandle> =>
  (await expect(
    await (await expectedElement('iframe')).contentFrame(),
  ).toMatchElement(selector, {
    text,
    timeout,
  })) as any;

export const expectedElement = async (
  selector: string,
  text?: string | RegExp,
  timeout = 2000,
): Promise<ElementHandle> =>
  (await expect(page).toMatchElement(selector, {text, timeout})) as any;

export const expectProperty = async (
  element: ElementHandle,
  property: string,
  value: string | boolean,
): Promise<void> =>
  expect(await (await element.getProperty(property))?.jsonValue()).toEqual(
    value,
  );

export const expectNoFramedElement = async (
  selector: string,
  text?: string | RegExp,
  timeout = 2000,
): Promise<void> => {
  await expect(
    await (await expectedElement('iframe')).contentFrame(),
  ).not.toMatchElement(selector, {text, timeout});
};
