import {createMergeableStore} from 'tinybase/mergeable-store';
import {createReactNativeMmkvPersister} from 'tinybase/persisters/persister-react-native-mmkv';
import {expect, test} from 'vitest';

test('preserves mergeable deletion tombstones', async () => {
  let persisted: string | undefined;
  const storage = {
    getString: () => persisted,
    set: (_key: string, value: string) => (persisted = value),
    addOnValueChangedListener: () => ({remove: () => {}}),
  };
  const store1 = createMergeableStore();
  const persister1 = createReactNativeMmkvPersister(
    store1,
    storage as any,
  );
  store1.setCell('pets', 'fido', 'species', 'dog');
  await persister1.save();
  store1.delCell('pets', 'fido', 'species');
  await persister1.save();

  const store2 = createMergeableStore();
  const persister2 = createReactNativeMmkvPersister(
    store2,
    storage as any,
  );
  await persister2.load();

  expect(store2.hasCell('pets', 'fido', 'species')).toBe(false);
});
