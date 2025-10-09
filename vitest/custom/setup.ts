import {afterEach, expect} from 'vitest';

afterEach(({task}) => {
  (task.meta as any).assertions = expect.getState().assertionCalls;
});
