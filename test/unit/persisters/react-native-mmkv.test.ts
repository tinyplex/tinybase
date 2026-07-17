import {createMergeableStore} from 'tinybase/mergeable-store';
import {createReactNativeMmkvPersister} from 'tinybase/persisters/persister-react-native-mmkv';
import {expect, test} from 'vitest';
import {pause} from '../common/other.ts';

test('preserves mergeable deletion tombstones', async () => {
  let persisted: string | undefined;
  const storage = {
    getString: () => persisted,
    set: (_key: string, value: string) => (persisted = value),
    addOnValueChangedListener: () => ({remove: () => {}}),
  };
  const store1 = createMergeableStore();
  const persister1 = createReactNativeMmkvPersister(store1, storage as any);
  store1.setCell('pets', 'fido', 'species', 'dog');
  await persister1.save();
  store1.delCell('pets', 'fido', 'species');
  await persister1.save();

  const store2 = createMergeableStore();
  const persister2 = createReactNativeMmkvPersister(store2, storage as any);
  await persister2.load();

  expect(store2.hasCell('pets', 'fido', 'species')).toBe(false);
});

test('reports malformed observed values safely', async () => {
  let persisted: string | undefined;
  let changed: (key: string) => void = () => {};
  const errors: any[] = [];
  const storage = {
    getString: () => persisted,
    set: (_key: string, value: string) => (persisted = value),
    addOnValueChangedListener: (listener: (key: string) => void) => {
      changed = listener;
      return {remove: () => {}};
    },
  };
  const store = createMergeableStore();
  const persister = createReactNativeMmkvPersister(
    store,
    storage as any,
    undefined,
    (error) => errors.push(error),
  );
  await persister.startAutoLoad();
  persisted = '{';

  expect(() => changed('storage')).not.toThrow();
  await pause(0);

  expect(errors).toHaveLength(1);
  expect(errors[0]).toBeInstanceOf(SyntaxError);
  expect(store.getContent()).toEqual([{}, {}]);
  await persister.destroy();
});
