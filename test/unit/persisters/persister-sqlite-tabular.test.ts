/* eslint-disable max-len */
import 'fake-indexeddb/auto';
import {Persister, Store, createStore} from 'tinybase/debug';
import {VARIANTS, getDatabaseFunctions} from './sqlite';
import {mockFetchWasm, pause} from '../common/other';
import {Database} from 'sqlite3';

describe.each(Object.entries(VARIANTS).slice(0, 1))(
  '%s',
  (_name, [getOpenDatabase, getPersister, cmd, close]) => {
    const [getDatabase, setDatabase] = getDatabaseFunctions(cmd);

    let db: Database;
    let store: Store;

    beforeEach(async () => {
      mockFetchWasm();
      db = await getOpenDatabase();
      store = createStore();
    });

    afterEach(async () => await close(db));

    describe.only('Config', () => {
      describe('save', () => {
        beforeEach(() => {
          store
            .setTables({t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}})
            .setValues({v1: 1, v2: 2});
        });

        test('default (off)', async () => {
          await getPersister(store, db, {mode: 'tabular'}).save();
          expect(await getDatabase(db)).toEqual([]);
        });

        describe('tables', () => {
          test('one to one', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {'*': {tableName: (tableName) => tableName}}},
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
                [{_id: 'r1', c1: 1}],
              ],
              [
                't2',
                'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c2")',
                [{_id: 'r2', c2: 2}],
              ],
            ]);
          });
          test('all mapped', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                save: {
                  '*': {tableName: (tableName) => 'test_' + tableName},
                },
              },
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual([
              [
                'test_t1',
                'CREATE TABLE "test_t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
                [{_id: 'r1', c1: 1}],
              ],
              [
                'test_t2',
                'CREATE TABLE "test_t2"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c2")',
                [{_id: 'r2', c2: 2}],
              ],
            ]);
          });
          test('mix of one to one, mapped, custom ids, off', async () => {
            store
              .setTable('t3', {r3: {c3: 3}})
              .setTable('t4', {r4: {c4: 4}})
              .setTable('t5', {r5: {c5: 5}});
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                save: {
                  '*': {
                    tableName: (tableName) => tableName,
                    rowIdColumnName: 'id',
                  },
                  t2: {rowIdColumnName: 'id2'},
                  t3: {tableName: 'test "t3"', rowIdColumnName: 'id "3"'},
                  t4: {
                    tableName: (tableName) => 'test_' + tableName,
                  },
                  t5: false,
                },
              },
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
                [{id: 'r1', c1: 1}],
              ],
              [
                't2',
                'CREATE TABLE "t2"("id2" PRIMARY KEY ON CONFLICT REPLACE, "c2")',
                [{id2: 'r2', c2: 2}],
              ],
              [
                'test "t3"',
                'CREATE TABLE "test ""t3"""("id ""3""" PRIMARY KEY ON CONFLICT REPLACE, "c3")',
                [{'id "3"': 'r3', c3: 3}],
              ],
              [
                'test_t4',
                'CREATE TABLE "test_t4"("id" PRIMARY KEY ON CONFLICT REPLACE, "c4")',
                [{id: 'r4', c4: 4}],
              ],
            ]);
          });
        });

        describe('values', () => {
          test('default', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              values: {save: true},
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual([
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1", "v2")',
                [{_id: '_', v1: 1, v2: 2}],
              ],
            ]);
          });

          describe('tableName', () => {
            test('word', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, tableName: 'values'},
              }).save();
              expect(await getDatabase(db)).toEqual([
                [
                  'values',
                  'CREATE TABLE "values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1", "v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              ]);
            });

            test('with space', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, tableName: 'tinybase values'},
              }).save();
              expect(await getDatabase(db)).toEqual([
                [
                  'tinybase values',
                  'CREATE TABLE "tinybase values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1", "v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              ]);
            });

            test('with quote', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, tableName: 'tinybase "values"'},
              }).save();
              expect(await getDatabase(db)).toEqual([
                [
                  'tinybase "values"',
                  'CREATE TABLE "tinybase ""values"""("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1", "v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              ]);
            });
          });

          describe('rowIdColumnName', () => {
            test('word', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, rowIdColumnName: 'id'},
              }).save();
              expect(await getDatabase(db)).toEqual([
                [
                  'tinybase_values',
                  'CREATE TABLE "tinybase_values"("id" PRIMARY KEY ON CONFLICT REPLACE, "v1", "v2")',
                  [{id: '_', v1: 1, v2: 2}],
                ],
              ]);
            });

            test('with space', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, rowIdColumnName: 'row id'},
              }).save();
              expect(await getDatabase(db)).toEqual([
                [
                  'tinybase_values',
                  'CREATE TABLE "tinybase_values"("row id" PRIMARY KEY ON CONFLICT REPLACE, "v1", "v2")',
                  [{'row id': '_', v1: 1, v2: 2}],
                ],
              ]);
            });

            test('with quote', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, rowIdColumnName: 'row "id"'},
              }).save();
              expect(await getDatabase(db)).toEqual([
                [
                  'tinybase_values',
                  'CREATE TABLE "tinybase_values"("row ""id""" PRIMARY KEY ON CONFLICT REPLACE, "v1", "v2")',
                  [{'row "id"': '_', v1: 1, v2: 2}],
                ],
              ]);
            });
          });
        });
      });
    });

    describe('Save to empty database', () => {
      test('nothing', async () => {
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
            [{_id: '_'}],
          ],
        ]);
      });

      test('tables', async () => {
        store.setTables({t1: {r1: {c1: 1}}});
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
            [{_id: '_'}],
          ],
        ]);
      });

      test('values', async () => {
        store.setValues({v1: 1});
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
      });

      test('both', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
      });

      test('both, change, and then load again', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
        await cmd(db, 'UPDATE t1 SET c1=? WHERE _id=?', [2, 'r1']);
        await cmd(db, 'UPDATE tinybase_values SET v1=? WHERE _id=?', [2, '_']);
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{_id: 'r1', c1: 2}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
            [{_id: '_', v1: 2}],
          ],
        ]);
        await persister1.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });

    describe('Load from database', () => {
      test('nothing', async () => {
        await persister1.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('defaulted', async () => {
        await persister1.load({t1: {r1: {c1: 1}}}, {v1: 1});
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('broken', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("di" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{di: 'r1', c1: 1}],
          ],
        ]);
        await persister1.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('broken, can default', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("di" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{di: 'r1', c1: 1}],
          ],
        ]);
        await persister1.load({t1: {r1: {c1: 1}}}, {v1: 1});
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('tables', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{_id: 'r1', c1: 1}],
          ],
        ]);
        await persister1.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      });

      test('values', async () => {
        await setDatabase(db, [
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
        await persister1.load();
        expect(store.getContent()).toEqual([{}, {v1: 1}]);
      });

      test('both', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
        await persister1.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('both, change, and then save again', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
        await persister1.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        await persister1.save();
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE, "c1")',
            [{_id: 'r1', c1: 2}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE, "v1")',
            [{_id: '_', v1: 2}],
          ],
        ]);
      });
    });

    describe('Two stores, one connection, one database', () => {
      let store2: Store;
      let persister2: Persister;
      beforeEach(() => {
        store2 = createStore();
        persister2 = getPersister(store2, db, {mode: 'tabular'});
      });

      test('manual', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        await persister2.load();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1', async () => {
        await persister1.startAutoSave();
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause();
        await persister2.load();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoLoad2', async () => {
        await persister2.startAutoLoad();
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        await pause();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2, complex transactions', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        store
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
        store.setCell('t1', 'r1', 'c1', 2);
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store.delCell('t1', 'r1', 'c1');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store.setValue('v1', 2);
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 2, v2: 2},
        ]);
        store.delValue('v1');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v2: 2},
        ]);
      });
    });
  },
);
