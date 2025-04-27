/* eslint-disable max-len */
import {resetHlc} from '../../common/mergeable.ts';
import {mockFetchWasm, pause, waitFor} from '../../common/other.ts';
import {MERGEABLE_VARIANTS, getDatabaseFunctions} from '../common/databases.ts';
import 'fake-indexeddb/auto';
import type {MergeableStore} from 'tinybase';
import {createMergeableStore} from 'tinybase';
import type {Persister} from 'tinybase/persisters';

beforeEach(() => {
  resetHlc();
});

describe.each(Object.entries(MERGEABLE_VARIANTS))(
  '%s',
  (
    _name,
    [
      getOpenDatabase,
      ,
      getPersister,
      cmd,
      close,
      autoLoadPause = 3,
      autoLoadIntervalSeconds = 0.001,
      isPostgres,
      supportsMultipleConnections,
    ],
  ) => {
    const [getDatabase, setDatabase] = getDatabaseFunctions(cmd, isPostgres);

    const columnType = isPostgres ? 'text' : '';

    let db: any;
    let store: MergeableStore;
    let persister: Persister;

    beforeEach(async () => {
      mockFetchWasm();
      db = await getOpenDatabase();
      store = createMergeableStore('s1');
      persister = await getPersister(store, db, {
        mode: 'json',
        autoLoadIntervalSeconds,
      });
    });

    afterEach(async () => {
      persister.destroy();
      await close(db);
    });

    describe('Custom table name', () => {
      test('as string', async () => {
        const persister = await getPersister(store, db, 'test');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          test: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[[{},"",0],[{},"",0]]'}],
          ],
        });
      });

      test('with spaces', async () => {
        const persister = await getPersister(store, db, 'test table');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          'test table': [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[[{},"",0],[{},"",0]]'}],
          ],
        });
      });

      test('with quote', async () => {
        const persister = await getPersister(store, db, 'test "table"');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          'test "table"': [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[[{},"",0],[{},"",0]]'}],
          ],
        });
      });

      test('as config', async () => {
        const persister = await getPersister(store, db, {
          mode: 'json',
          storeTableName: 'test',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          test: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[[{},"",0],[{},"",0]]'}],
          ],
        });
      });
    });

    describe('Save to empty database', () => {
      test('nothing', async () => {
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[[{},"",0],[{},"",0]]'}],
          ],
        });
      });

      test('nothing, empty config', async () => {
        const persister = await getPersister(store, db, {
          mode: 'json',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[[{},"",0],[{},"",0]]'}],
          ],
        });
      });

      test('tables', async () => {
        store.setTables({t1: {r1: {c1: 1}}});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [
              {
                _id: '_',
                store:
                  '[[{"t1":[{"r1":[{"c1":[1,"Nn1JUF-----7JQY8",1003668370]},"",550994372]},"",1072852846]},"",1771939739],[{},"",0]]',
              },
            ],
          ],
        });
      });

      test('values', async () => {
        store.setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [
              {
                _id: '_',
                store:
                  '[[{},"",0],[{"v1":[1,"Nn1JUF-----7JQY8",1003668370]},"",4180671758]]',
              },
            ],
          ],
        });
      });

      test('both', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [
              {
                _id: '_',
                store:
                  '[[{"t1":[{"r1":[{"c1":[1,"Nn1JUF-----7JQY8",1003668370]},"",550994372]},"",1072852846]},"",1771939739],[{"v1":[1,"Nn1JUF----07JQY8",1130939691]},"",3877632732]]',
              },
            ],
          ],
        });
      });

      test('both, change, and then load again', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [
              {
                _id: '_',
                store:
                  '[[{"t1":[{"r1":[{"c1":[1,"Nn1JUF-----7JQY8",1003668370]},"",550994372]},"",1072852846]},"",1771939739],[{"v1":[1,"Nn1JUF----07JQY8",1130939691]},"",3877632732]]',
              },
            ],
          ],
        });
        await cmd(db, 'UPDATE tinybase SET store=$1 WHERE _id=$2', [
          '[{"t1":{"r1":{"c1":2}}},{"v1":2}]',
          '_',
        ]);
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":2}}},{"v1":2}]'}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });

    describe('Load from database', () => {
      test('nothing', async () => {
        await persister.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('defaulted', async () => {
        await persister.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('broken', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "store" ' +
              columnType +
              ')',
            [{_id: '_', store: '[{"t1":1}]'}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('broken, can default', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "store" ' +
              columnType +
              ')',
            [{_id: '_', store: '[{"t1":}]'}],
          ],
        });
        await persister.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('tables', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "store" ' +
              columnType +
              ')',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{}]'}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      });

      test('values', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "store" ' +
              columnType +
              ')',
            [{_id: '_', store: '[{}, {"v1":1}]'}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{}, {v1: 1}]);
      });

      describe('both', () => {
        beforeEach(async () => {
          await setDatabase(db, {
            tinybase: [
              'CREATE TABLE "tinybase" ("_id" ' +
                columnType +
                ' PRIMARY KEY, "store" ' +
                columnType +
                ')',
              [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
            ],
          });
        });

        test('check', async () => {
          await persister.load();
          expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        });

        test('then delete', async () => {
          await persister.load();
          await cmd(db, 'UPDATE tinybase SET store=$1 WHERE _id=$2', [
            '[{},{}]',
            '_',
          ]);
          await persister.load();
          expect(store.getContent()).toEqual([{}, {}]);
        });
      });

      test('both, change, and then save again', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "store" ' +
              columnType +
              ')',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [
              {
                _id: '_',
                store:
                  '[[{"t1":[{"r1":[{"c1":[2,"Nn1JUF----17JQY8",1804136345]},"",1353168687]},"",3452927302]},"",198638919],[{"v1":[2,"Nn1JUF----27JQY8",3879084990]},"",3581950501]]',
              },
            ],
          ],
        });
      });
    });

    describe('Two stores, one connection, one database', () => {
      let store2: MergeableStore;
      let persister2: Persister;

      beforeEach(async () => {
        store2 = createMergeableStore('s2');
        persister2 = await getPersister(store2, db, {
          mode: 'json',
          autoLoadIntervalSeconds,
        });
      });

      afterEach(async () => {
        persister2.destroy();
      });

      test('manual', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        await persister2.load();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1', async () => {
        await persister.startAutoSave();
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause();
        await persister2.load();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoLoad2', async () => {
        await persister2.startAutoLoad();
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        }, 1000);
      });

      test('autoSave1 & autoLoad2', async () => {
        await persister.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        }, 1000);
      });

      test('autoSave1 & autoLoad2, complex transactions', async () => {
        await persister.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store
          .setTables({
            t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
            t2: {r1: {c1: 1}},
          })
          .setValues({v1: 1, v2: 2});
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store.setCell('t1', 'r1', 'c1', 2);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store.delCell('t1', 'r1', 'c2');
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store.delRow('t1', 'r2');
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 2}}, t2: {r1: {c1: 1}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store.delTable('t2');
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 2}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store.delValue('v2');
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
        }, 1000);
        store.setValue('v1', 2);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        }, 1000);
      }, 20000);
    });

    describe('Two stores, two connections, one database', () => {
      if (!supportsMultipleConnections) {
        return;
      }

      let db2: any;
      let store2: MergeableStore;
      let persister2: Persister;

      beforeEach(async () => {
        db2 = await getOpenDatabase(db);
        store2 = createMergeableStore('s2');
        persister2 = await getPersister(store2, db2, {
          mode: 'json',
          autoLoadIntervalSeconds,
        });
      });

      afterEach(async () => {
        persister2.destroy();
        await close(db2);
      });

      test('manual', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        await persister2.load();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1', async () => {
        await persister.startAutoSave();
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause();
        await persister2.load();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoLoad2', async () => {
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2', async () => {
        await persister.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2, complex transactions', async () => {
        await persister.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store
          .setTables({
            t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
            t2: {r1: {c1: 1}},
          })
          .setValues({v1: 1, v2: 2});
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store.setCell('t1', 'r1', 'c1', 2);
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store.delCell('t1', 'r1', 'c2');
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store.delRow('t1', 'r2');
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store.delTable('t2');
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}}},
          {v1: 1, v2: 2},
        ]);
        store.delValue('v2');
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
        store.setValue('v1', 2);
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });
  },
);
