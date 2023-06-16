/* eslint-disable max-len */
import 'fake-indexeddb/auto';
import {Persister, Store, createStore} from 'tinybase/debug';
import {VARIANTS, getDatabaseFunctions} from './sqlite';
import {mockFetchWasm, pause} from '../common/other';
import {Database} from 'sqlite3';

describe.each(Object.entries(VARIANTS))(
  '%s',
  (_name, [getOpenDatabase, getPersister, cmd, close]) => {
    const [getDatabase, setDatabase] = getDatabaseFunctions(cmd);

    let db: Database;
    let store1: Store;
    let persister1: Persister;

    beforeEach(async () => {
      mockFetchWasm();
      db = await getOpenDatabase();
      store1 = createStore();
      persister1 = getPersister(store1, db);
    });

    afterEach(async () => await close(db));

    describe('Custom table name', () => {
      test('as string', async () => {
        const persister = getPersister(store1, db, 'test');
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            'test',
            'CREATE TABLE "test"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        ]);
      });

      test('with spaces', async () => {
        const persister = getPersister(store1, db, 'test table');
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            'test table',
            'CREATE TABLE "test table"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        ]);
      });

      test('with quote', async () => {
        const persister = getPersister(store1, db, 'test "table"');
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            'test "table"',
            'CREATE TABLE "test ""table"""("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        ]);
      });

      test('as config', async () => {
        const persister = getPersister(store1, db, {
          mode: 'json',
          storeTableName: 'test',
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            'test',
            'CREATE TABLE "test"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        ]);
      });
    });

    describe('Save to empty database', () => {
      test('nothing', async () => {
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        ]);
      });

      test('nothing, empty config', async () => {
        const persister = getPersister(store1, db, {mode: 'json'});
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{},{}]'}],
          ],
        ]);
      });

      test('tables', async () => {
        store1.setTables({t1: {r1: {c1: 1}}});
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{}]'}],
          ],
        ]);
      });

      test('values', async () => {
        store1.setValues({v1: 1});
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{},{"v1":1}]'}],
          ],
        ]);
      });

      test('both', async () => {
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        ]);
      });

      test('both, change, and then load again', async () => {
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        ]);
        await cmd(db, 'UPDATE tinybase SET store=? WHERE _id=?', [
          '[{"t1":{"r1":{"c1":2}}},{"v1":2}]',
          '_',
        ]);
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":2}}},{"v1":2}]'}],
          ],
        ]);
        await persister1.load();
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });

    describe('Load from database', () => {
      test('nothing', async () => {
        await persister1.load();
        expect(store1.getContent()).toEqual([{}, {}]);
      });

      test('defaulted', async () => {
        await persister1.load({t1: {r1: {c1: 1}}}, {v1: 1});
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('broken', async () => {
        await setDatabase(db, [
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":1}]'}],
          ],
        ]);
        await persister1.load();
        expect(store1.getContent()).toEqual([{}, {}]);
      });

      test('broken, can default', async () => {
        await setDatabase(db, [
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":}]'}],
          ],
        ]);
        await persister1.load({t1: {r1: {c1: 1}}}, {v1: 1});
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('tables', async () => {
        await setDatabase(db, [
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{}]'}],
          ],
        ]);
        await persister1.load();
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      });

      test('values', async () => {
        await setDatabase(db, [
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{}, {"v1":1}]'}],
          ],
        ]);
        await persister1.load();
        expect(store1.getContent()).toEqual([{}, {v1: 1}]);
      });

      test('both', async () => {
        await setDatabase(db, [
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        ]);
        await persister1.load();
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('both, change, and then save again', async () => {
        await setDatabase(db, [
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        ]);
        await persister1.load();
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store1.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
        expect(store1.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase',
            'CREATE TABLE "tinybase"("_id" PRIMARY KEY ON CONFLICT REPLACE, "store")',
            [{_id: '_', store: '[{"t1":{"r1":{"c1":2}}},{"v1":2}]'}],
          ],
        ]);
      });
    });

    describe('Two stores, one connection, one database', () => {
      let store2: Store;
      let persister2: Persister;
      beforeEach(() => {
        store2 = createStore();
        persister2 = getPersister(store2, db);
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
        await pause();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause();
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
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delCell('t1', 'r1', 'c2');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 1}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delRow('t1', 'r2');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delTable('t2');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delValue('v2');
        await pause();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store1.setCell('t1', 'r1', 'c1', 2);
        await pause();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
        store1.setValue('v1', 2);
        await pause();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });
  },
);
