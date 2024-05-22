/* eslint-disable max-len */
import 'fake-indexeddb/auto';
import {Persister, Store, createStore} from 'tinybase/debug';
import {VARIANTS, getDatabaseFunctions} from './sqlite';
import {mockFetchWasm, pause} from '../common/other';
import {Database} from 'sqlite3';

describe.each(Object.entries(VARIANTS))(
  '%s',
  (
    _name,
    [
      getOpenDatabase,
      ,
      getPersister,
      cmd,
      close,
      autoLoadPause = 20,
      autoLoadIntervalSeconds = 0.02,
    ],
  ) => {
    const [getDatabase, setDatabase] = getDatabaseFunctions(cmd);

    let db: Database;
    let store: Store;
    let persister: Persister;

    beforeEach(async () => {
      mockFetchWasm();
      db = await getOpenDatabase();
      store = createStore();
      persister = getPersister(store, db);
    });

    afterEach(async () => await close(db));

    describe('Config', () => {
      test('tableName as string', async () => {
        const persister = getPersister(store, db, 'test');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          test: [
            'CREATE TABLE "test"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('tableName with spaces', async () => {
        const persister = getPersister(store, db, 'test table');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          'test table': [
            'CREATE TABLE "test table"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('tableName with quote', async () => {
        const persister = getPersister(store, db, 'test "table"');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          'test "table"': [
            'CREATE TABLE "test ""table"""("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('tableName as config', async () => {
        const persister = getPersister(store, db, {
          mode: 'json',
          storeTableName: 'test',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          test: [
            'CREATE TABLE "test"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('storeIdColumnName as string with quotes and spaces', async () => {
        const persister = getPersister(store, db, {
          mode: 'json',
          storeIdColumnName: 'test "id"',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("test ""id""" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{'test "id"': '_', store: '[{},{}]'}],
          ],
        });
      });

      test('storeColumnName as string with quotes and spaces', async () => {
        const persister = getPersister(store, db, {
          mode: 'json',
          storeColumnName: 'test "store"',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"test ""store""")',
            [{_id: '_', 'test "store"': '[{},{}]'}],
          ],
        });
      });
    });

    describe('Save to empty database', () => {
      test('nothing', async () => {
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('nothing, empty config', async () => {
        const persister = getPersister(store, db, {
          mode: 'json',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('tables', async () => {
        store.setTables({t1: {r1: {c1: 1}}});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{}]'}],
          ],
        });
      });

      test('values', async () => {
        store.setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{},{"v1":1}]'}],
          ],
        });
      });

      test('both', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
      });

      test('both, change, and then load again', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
        await cmd(db, 'UPDATE tinybase SET store=? WHERE _id=?', [
          '[{"t1":{"r1":{"c1":2}}},{"v1":2}]',
          '_',
        ]);
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
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
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{"t1":1}]'}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('broken, can default', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{"t1":}]'}],
          ],
        });
        await persister.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('tables', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{}]'}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      });

      test('values', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
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
              'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
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
          await cmd(db, 'UPDATE tinybase SET store=? WHERE _id=?', [
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
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
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
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":2}}},{"v1":2}]'}],
          ],
        });
      });
    });

    describe('Two stores, one connection, one database', () => {
      let store1: Store;
      let persister1: Persister;
      let store2: Store;
      let persister2: Persister;
      beforeEach(() => {
        store1 = createStore();
        persister1 = getPersister(store1, db, {
          mode: 'json',
          autoLoadIntervalSeconds,
        });
        store2 = createStore();
        persister2 = getPersister(store2, db, {
          mode: 'json',
          autoLoadIntervalSeconds,
        });
      });

      test('manual', async () => {
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        await persister2.load();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1', async () => {
        await persister1.startAutoSave();
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause();
        await persister2.load();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoLoad2', async () => {
        await persister2.startAutoLoad();
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2, complex transactions', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        store1
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
        store1.setCell('t1', 'r1', 'c1', 2);
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delCell('t1', 'r1', 'c2');
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delRow('t1', 'r2');
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delTable('t2');
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}}},
          {v1: 1, v2: 2},
        ]);
        store1.delValue('v2');
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
        store1.setValue('v1', 2);
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      }, 20000);
    });

    test('Multiple stores in different tables', async () => {
      const store1 = createStore();
      const persister1 = getPersister(store1, db, {
        mode: 'json',
        storeTableName: 'store1',
        autoLoadIntervalSeconds,
      });
      const store2 = createStore();
      const persister2 = getPersister(store2, db, {
        mode: 'json',
        storeTableName: 'store2',
        autoLoadIntervalSeconds,
      });

      store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
      await persister1.startAutoSave();
      await persister1.startAutoLoad();

      store2.setTables({t2: {r2: {c2: 2}}}).setValues({v2: 2});
      await persister2.startAutoSave();
      await persister2.startAutoLoad();

      expect(await getDatabase(db)).toEqual({
        store1: [
          'CREATE TABLE "store1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
          [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
        ],
        store2: [
          'CREATE TABLE "store2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"store")',
          [{_id: '_', store: '[{"t2":{"r2":{"c2":2}}},{"v2":2}]'}],
        ],
      });
      expect(persister1.getStats()).toEqual({loads: 1, saves: 1});
      expect(persister2.getStats()).toEqual({loads: 1, saves: 1});

      await cmd(db, 'UPDATE store1 SET store=? WHERE _id=?', [
        '[{"t3":{"r3":{"c3":3}}},{"v3":3}]',
        '_',
      ]);
      await pause(autoLoadPause);
      expect(store1.getContent()).toEqual([{t3: {r3: {c3: 3}}}, {v3: 3}]);
      expect(persister1.getStats()).toEqual({loads: 2, saves: 1});
      expect(persister2.getStats()).toEqual({loads: 1, saves: 1});

      await cmd(db, 'UPDATE store21 SET store=? WHERE _id=?', [
        '[{"t4":{"r4":{"c4":4}}},{"v4":4}]',
        '_',
      ]);
      await pause(autoLoadPause);
      expect(store1.getContent()).toEqual([{t4: {r4: {c4: 4}}}, {v4: 4}]);
      expect(persister1.getStats()).toEqual({loads: 2, saves: 1});
      expect(persister2.getStats()).toEqual({loads: 2, saves: 1});
    });
  },
);
