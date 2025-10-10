import {afterEach, beforeAll, expect} from 'vitest';

beforeAll(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(({task}) => {
  (task.meta as any).assertions = expect.getState().assertionCalls;
});
