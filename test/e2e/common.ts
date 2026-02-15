import {Locator, Page, expect} from '@playwright/test';
import {Server} from 'http';
import {createTestServer} from '../server.mjs';

export const getServerFunctions = (
  port: number,
): [() => void, () => void, (page: Page, path: string) => Promise<void>] => {
  const DOMAIN = `http://0.0.0.0:${port}`;

  let server: Server;

  const startServer = () => {
    server = createTestServer('docs', port, false);
  };

  const stopServer = () => {
    server.close();
  };

  const expectPage = async (page: Page, path: string): Promise<void> => {
    await page.goto(`${DOMAIN}${path}`);
  };

  return [startServer, stopServer, expectPage];
};

export const expectedFramedElement = async (
  page: Page,
  selector: string,
  text?: string | RegExp,
  options: number | {timeout?: number; state?: 'visible' | 'attached'} = 5000,
): Promise<Locator> => {
  const timeout =
    typeof options === 'number' ? options : (options.timeout ?? 5000);
  const state =
    typeof options === 'number' ? 'visible' : (options.state ?? 'visible');
  const frame = page.frameLocator('iframe').first();
  const locator = frame.locator(selector);

  const element = text
    ? locator.filter({hasText: text}).first()
    : locator.first();

  if (state === 'visible') {
    await expect(element).toBeVisible({timeout});
  } else {
    await expect(element).toBeAttached({timeout});
  }
  return element;
};

export const expectedFramedSvgElement = async (
  page: Page,
  selector: string,
  text?: string | RegExp,
  timeout = 5000,
): Promise<Locator> =>
  expectedFramedElement(page, `svg ${selector}`, text, {
    timeout,
    state: 'attached',
  });

export const expectedElement = async (
  page: Page,
  selector: string,
  text?: string | RegExp,
  timeout = 5000,
): Promise<Locator> => {
  const locator = page.locator(selector);

  if (text) {
    const filtered = locator.filter({hasText: text}).first();
    await expect(filtered).toBeVisible({timeout});
    return filtered;
  }

  const element = locator.first();
  await expect(element).toBeVisible({timeout});
  return element;
};

export const expectProperty = async (
  element: Locator,
  property: string,
  value: string | boolean,
): Promise<void> => {
  const propValue = await element.evaluate(
    (el: any, prop) => el[prop],
    property,
  );
  expect(propValue).toEqual(value);
};

export const expectNoFramedElement = async (
  page: Page,
  selector: string,
  text?: string | RegExp,
  timeout = 5000,
): Promise<void> => {
  const frame = page.frameLocator('iframe').first();
  const locator = frame.locator(selector);

  if (text) {
    await expect(locator.filter({hasText: text})).toBeHidden({timeout});
  } else {
    await expect(locator).toBeHidden({timeout});
  }
};
