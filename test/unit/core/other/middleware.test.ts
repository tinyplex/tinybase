import {beforeEach, describe, expect, test} from 'vitest';

import type {Middleware, Store} from 'tinybase';
import {createMiddleware, createStore} from 'tinybase';

let store: Store;
let middleware: Middleware;

beforeEach(() => {
  store = createStore();
  middleware = createMiddleware(store);
});

describe('Creates', () => {
  test('basic', () => {
    expect(middleware).toBeDefined();
  });

  test('getStore', () => {
    expect(middleware.getStore()).toBe(store);
  });

  test('same middleware for same store', () => {
    expect(createMiddleware(store)).toBe(middleware);
  });
});

describe('Destroys', () => {
  test('basic', () => {
    middleware.destroy();
  });
});
