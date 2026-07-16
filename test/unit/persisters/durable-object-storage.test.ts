import {createMergeableStore} from 'tinybase/mergeable-store';
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage';
import {expect, test, vi} from 'vitest';

const createStorage = (failBatch?: number) => {
  let data = new Map<string, any>([['existing', 'safe']]);
  const batchSizes: number[] = [];
  const put = vi.fn();
  const transaction = vi.fn(
    async (
      closure: (transaction: DurableObjectTransaction) => Promise<void>,
    ) => {
      const newData = new Map(data);
      let batch = 0;
      await closure({
        put: async (entries: Record<string, any>) => {
          batch++;
          batchSizes.push(Object.keys(entries).length);
          if (batch == failBatch) {
            throw new Error('batch failed');
          }
          Object.entries(entries).forEach(([key, value]) =>
            newData.set(key, value),
          );
        },
      } as DurableObjectTransaction);
      data = newData;
    },
  );
  return {
    batchSizes,
    getData: () => data,
    storage: {
      list: async () => data,
      put,
      transaction,
    } as any,
    transaction,
  };
};

test('chunks Durable Object writes within one transaction', async () => {
  const {batchSizes, storage, transaction} = createStorage();
  const values = Object.fromEntries(
    Array.from({length: 130}, (_, index) => ['value' + index, index]),
  );
  const persister = createDurableObjectStoragePersister(
    createMergeableStore().setValues(values),
    storage,
  );
  await persister.save();

  expect(transaction).toHaveBeenCalledOnce();
  expect(Math.max(...batchSizes)).toBe(128);
  expect(batchSizes.reduce((total, size) => total + size, 0)).toBeGreaterThan(
    128,
  );
  expect(storage.put).not.toHaveBeenCalled();
});

test('rolls back failed Durable Object write batches', async () => {
  const {getData, storage} = createStorage(2);
  const ignoredError = vi.fn();
  const values = Object.fromEntries(
    Array.from({length: 130}, (_, index) => ['value' + index, index]),
  );
  const persister = createDurableObjectStoragePersister(
    createMergeableStore().setValues(values),
    storage,
    '',
    ignoredError,
  );
  await persister.save();

  expect([...getData()]).toEqual([['existing', 'safe']]);
  expect(ignoredError.mock.calls[0][0].message).toBe('batch failed');
});
