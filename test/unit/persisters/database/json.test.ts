import {mockFetchWasm, pause, waitFor} from '../../common/other.ts';
import {ALL_VARIANTS, getDatabaseFunctions} from '../common/databases.ts';
import 'fake-indexeddb/auto';
import type {Store} from 'tinybase';
import {createStore} from 'tinybase';
import type {Persister} from 'tinybase/persisters';

describe.each(Object.entries(ALL_VARIANTS))(
  '%s',
  (
    name,
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
    let store: Store;
    let persister: Persister;

    beforeEach(async () => {
      mockFetchWasm();
      db = await getOpenDatabase();
      store = createStore();
      persister = await getPersister(store, db, {
        mode: 'json',
        autoLoadIntervalSeconds,
      });
    });

    afterEach(async () => {
      persister.destroy();
      await close(db);
    });

    describe('Config', () => {
      test('tableName as string', async () => {
        const persister = await getPersister(store, db, 'test');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          test: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('tableName with spaces', async () => {
        const persister = await getPersister(store, db, 'test table');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          'test table': [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('tableName with quote', async () => {
        const persister = await getPersister(store, db, 'test "table"');
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          'test "table"': [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('tableName as config', async () => {
        const persister = await getPersister(store, db, {
          mode: 'json',
          storeTableName: 'test',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          test: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('storeIdColumnName as string with quotes and spaces', async () => {
        const persister = await getPersister(store, db, {
          mode: 'json',
          storeIdColumnName: 'test "id"',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {'test "id"': columnType, store: columnType},
            [{'test "id"': '_', store: '[{},{}]'}],
          ],
        });
      });

      test('storeColumnName as string with quotes and spaces', async () => {
        const persister = await getPersister(store, db, {
          mode: 'json',
          storeColumnName: 'test "store"',
          autoLoadIntervalSeconds,
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, 'test "store"': columnType},
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
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{},{}]'}],
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
            [{_id: '_', store: '[{},{}]'}],
          ],
        });
      });

      test('tables', async () => {
        store.setTables({t1: {r1: {c1: 1}}});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{}]'}],
          ],
        });
      });

      test('values', async () => {
        store.setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{},{"v1":1}]'}],
          ],
        });
      });

      test('both', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
      });

      test('both, change, and then load again', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
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

    describe('Co-erce database', () => {
      beforeEach(() => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
      });

      test('no table', async () => {
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
      });

      test('wrong table, not removed', async () => {
        await setDatabase(db, {
          tinybase2: [
            'CREATE TABLE "tinybase2"("a" ' +
              columnType +
              ' PRIMARY KEY,"b" ' +
              columnType +
              ')',
            [{a: 'a', b: 'b'}],
          ],
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
          tinybase2: [{a: columnType, b: columnType}, [{a: 'a', b: 'b'}]],
        });
      });

      test('table, empty', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "store" ' +
              columnType +
              ')',
            [],
          ],
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
      });

      test('table, wrong row, removed', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "store" ' +
              columnType +
              ')',
            [{_id: 'a', store: 'b'}],
          ],
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
      });

      test('table, empty, missing key', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("store" ' + columnType + ')',
            [],
          ],
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
      });

      test('table, empty, missing column', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' + columnType + ' PRIMARY KEY)',
            [],
          ],
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
      });

      test('table, empty, wrong column, replaced', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY,"b" ' +
              columnType +
              ')',
            [],
          ],
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
      });

      test('table, empty, extra column, removed', async () => {
        await setDatabase(db, {
          tinybase: [
            'CREATE TABLE "tinybase" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "store" ' +
              columnType +
              ', "b" ' +
              columnType +
              ')',
            [],
          ],
        });
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          tinybase: [
            {_id: columnType, store: columnType},
            [{_id: '_', store: '[{"t1":{"r1":{"c1":1}}},{"v1":1}]'}],
          ],
        });
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
            [{_id: '_', store: '[{"t1":{"r1":{"c1":2}}},{"v1":2}]'}],
          ],
        });
      });

      test('autoLoad', async () => {
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
        await persister.startAutoLoad();
        await pause(autoLoadPause);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        await cmd(db, 'UPDATE tinybase SET store=$1 WHERE _id=$2', [
          '[{"t1":{"r1":{"c1":2}}},{"v1":2}]',
          '_',
        ]);
        await pause(autoLoadPause);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });

      test('autoLoad, table dropped and recreated', async () => {
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
        await persister.startAutoLoad();
        await pause(autoLoadPause);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        await cmd(db, 'DROP TABLE tinybase');
        await cmd(
          db,
          'CREATE TABLE "tinybase" ("_id" ' +
            columnType +
            ' PRIMARY KEY, "store" ' +
            columnType +
            ')',
        );
        await cmd(db, 'INSERT INTO tinybase (_id, store) VALUES ($1, $2)', [
          '_',
          '[{"t1":{"r1":{"c1":3}}},{"v1":3}]',
        ]);
        await pause(autoLoadPause);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 3}}}, {v1: 3}]);
        await cmd(db, 'UPDATE tinybase SET store = $1 WHERE _id = $2', [
          '[{"t1":{"r1":{"c1":4}}},{"v1":4}]',
          '_',
        ]);
        await pause(autoLoadPause);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 4}}}, {v1: 4}]);
      });
    });

    describe('Two stores, one connection, one database', () => {
      let store2: Store;
      let persister2: Persister;

      beforeEach(async () => {
        store2 = createStore();
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
        await pause(autoLoadPause);
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
          // todo this is failing
          expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        }, 1000);
      });

      test('autoSave1 & autoLoad2, complex transactions', async () => {
        await persister.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store.setContent([
          {
            t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
            t2: {r1: {c1: 1}},
          },
          {v1: 1, v2: 2},
        ]);
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
      }, 20000);
    });

    describe('Two stores, two connections, one database', () => {
      if (!supportsMultipleConnections) {
        return;
      }

      let db2: any;
      let store2: Store;
      let persister2: Persister;

      beforeEach(async () => {
        mockFetchWasm();
        db2 = await getOpenDatabase(db);
        store2 = createStore();
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
        store.setContent([
          {
            t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
            t2: {r1: {c1: 1}},
          },
          {v1: 1, v2: 2},
        ]);
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
