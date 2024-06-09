import type {Id} from 'tinybase/debug';
import {Listener} from './types.ts';

export const expectChanges = (
  listener: Listener,
  id: Id,
  ...expectedChanges: any[]
): void => {
  const log: any[] = listener.logs[id];
  expectedChanges.forEach((expectedChange) =>
    expect(JSON.stringify(log.shift())).toEqual(JSON.stringify(expectedChange)),
  );
};

export const expectChangesNoJson = (
  listener: Listener,
  id: Id,
  ...expectedChanges: any[]
): void => {
  const log: any[] = listener.logs[id];
  expectedChanges.forEach((expectedChange) =>
    expect(log.shift()).toEqual(expectedChange),
  );
};

export const expectNoChanges = (listener: Listener): void => {
  Object.values(listener.logs).forEach((log) => expect(log).toHaveLength(0));
};

expect.extend({
  toEqualWithOrder: (received, expected) =>
    JSON.stringify(received) === JSON.stringify(expected)
      ? {
          message: () =>
            `expected ${JSON.stringify(
              received,
            )} not to order-equal ${JSON.stringify(expected)}`,
          pass: true,
        }
      : {
          message: () =>
            `expected ${JSON.stringify(
              received,
            )} to order-equal ${JSON.stringify(expected)}`,
          pass: false,
        },
});
