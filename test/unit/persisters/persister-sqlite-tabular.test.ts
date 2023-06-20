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
    let store: Store;

    beforeEach(async () => {
      mockFetchWasm();
      db = await getOpenDatabase();
      store = createStore();
    });

    afterEach(async () => await close(db));

    describe('Config', () => {
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
              tables: {save: {'*': {tableName: (tableId) => tableId}}},
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
              [
                't2',
                'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [{_id: 'r2', c2: 2}],
              ],
            ]);
          });
          test('all mapped', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                save: {
                  '*': {tableName: (tableId) => 'test_' + tableId},
                },
              },
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual([
              [
                'test_t1',
                'CREATE TABLE "test_t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
              [
                'test_t2',
                'CREATE TABLE "test_t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
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
                    tableName: (tableId) => tableId,
                    rowIdColumnName: 'id',
                  },
                  t2: {rowIdColumnName: 'id2'},
                  t3: {tableName: 'test "t3"', rowIdColumnName: 'id "3"'},
                  t4: {tableName: (tableId) => 'test_' + tableId},
                  t5: false,
                },
              },
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{id: 'r1', c1: 1}],
              ],
              [
                't2',
                'CREATE TABLE "t2"("id2" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [{id2: 'r2', c2: 2}],
              ],
              [
                'test "t3"',
                'CREATE TABLE "test ""t3"""("id ""3""" PRIMARY KEY ON CONFLICT REPLACE,"c3")',
                [{'id "3"': 'r3', c3: 3}],
              ],
              [
                'test_t4',
                'CREATE TABLE "test_t4"("id" PRIMARY KEY ON CONFLICT REPLACE,"c4")',
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
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                [{_id: '_', v1: 1, v2: 2}],
              ],
            ]);
          });

          describe('tableName', () => {
            test('as string', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, tableName: 'values'},
              }).save();
              expect(await getDatabase(db)).toEqual([
                [
                  'values',
                  'CREATE TABLE "values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
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
                  'CREATE TABLE "tinybase values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
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
                  'CREATE TABLE "tinybase ""values"""("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              ]);
            });
          });

          describe('rowIdColumnName', () => {
            test('as string', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, rowIdColumnName: 'id'},
              }).save();
              expect(await getDatabase(db)).toEqual([
                [
                  'tinybase_values',
                  'CREATE TABLE "tinybase_values"("id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
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
                  'CREATE TABLE "tinybase_values"("row id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
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
                  'CREATE TABLE "tinybase_values"("row ""id""" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{'row "id"': '_', v1: 1, v2: 2}],
                ],
              ]);
            });
          });
        });
      });

      describe('load', () => {
        beforeEach(async () => {
          await setDatabase(db, [
            [
              't1',
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            [
              't2',
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
              [{_id: 'r2', c2: 2}],
            ],
            [
              'tinybase_values',
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          ]);
        });

        test('default (on)', async () => {
          await getPersister(store, db, {mode: 'tabular'}).load();
          expect(store.getContent()).toEqual([
            {t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}},
            {v1: 1, v2: 2},
          ]);
        });

        describe('tables', () => {
          test('off', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {load: false},
            }).load();
            expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
          });
          test('all mapped', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                load: {'*': {tableId: (tableName) => 'test_' + tableName}},
              },
            }).load();
            expect(store.getContent()).toEqual([
              {test_t1: {r1: {c1: 1}}, test_t2: {r2: {c2: 2}}},
              {v1: 1, v2: 2},
            ]);
          });
          test('mix of one to one, mapped, custom ids, off', async () => {
            db = await getOpenDatabase();
            await setDatabase(db, [
              [
                't1',
                'CREATE TABLE "t1"("id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{id: 'r1', c1: 1}],
              ],
              [
                't2',
                'CREATE TABLE "t2"("id2" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [{id2: 'r2', c2: 2}],
              ],
              [
                't3',
                'CREATE TABLE "t3"("id ""3""" PRIMARY KEY ON CONFLICT REPLACE,"c3")',
                [{'id "3"': 'r3', c3: 3}],
              ],
              [
                't4',
                'CREATE TABLE "t4"("id" PRIMARY KEY ON CONFLICT REPLACE,"c4")',
                [{id: 'r4', c4: 4}],
              ],
              [
                't5',
                'CREATE TABLE "t5"("id" PRIMARY KEY ON CONFLICT REPLACE,"c5")',
                [{id: 'r5', c5: 5}],
              ],
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                [{_id: '_', v1: 1, v2: 2}],
              ],
            ]);
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                load: {
                  '*': {
                    tableId: (tableName) => tableName,
                    rowIdColumnName: 'id',
                  },
                  t2: {rowIdColumnName: 'id2'},
                  t3: {tableId: 'test "t3"', rowIdColumnName: 'id "3"'},
                  t4: {tableId: (tableId) => 'test_' + tableId},
                  t5: false,
                },
              },
            }).load();
            expect(store.getContent()).toEqual([
              {
                t1: {r1: {c1: 1}},
                t2: {r2: {c2: 2}},
                'test "t3"': {r3: {c3: 3}},
                test_t4: {r4: {c4: 4}},
              },
              {v1: 1, v2: 2},
            ]);
          });
        });

        describe('values', () => {
          test('off', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              values: {load: false},
            }).load();
            expect(store.getContent()).toEqual([
              {t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}},
              {},
            ]);
          });

          describe('tableName', () => {
            test('as string', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, [
                [
                  'values',
                  'CREATE TABLE "values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              ]);
              await getPersister(store, db, {
                mode: 'tabular',
                values: {tableName: 'values'},
              }).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });

            test('with space', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, [
                [
                  'tinybase values',
                  'CREATE TABLE "tinybase values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              ]);
              await getPersister(store, db, {
                mode: 'tabular',
                values: {tableName: 'tinybase values'},
              }).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });

            test('with quote', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, [
                [
                  'tinybase "values"',
                  'CREATE TABLE "tinybase ""values"""("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              ]);
              await getPersister(store, db, {
                mode: 'tabular',
                values: {tableName: 'tinybase "values"'},
              }).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });
          });

          describe('rowIdColumnName', () => {
            test('as string', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, [
                [
                  'tinybase_values',
                  'CREATE TABLE "tinybase_values"("id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{id: '_', v1: 1, v2: 2}],
                ],
              ]);
              await getPersister(store, db, {
                mode: 'tabular',
                values: {rowIdColumnName: 'id'},
              }).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });

            test('with space', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, [
                [
                  'tinybase_values',
                  'CREATE TABLE "tinybase_values"("row id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{'row id': '_', v1: 1, v2: 2}],
                ],
              ]);
              await getPersister(store, db, {
                mode: 'tabular',
                values: {rowIdColumnName: 'row id'},
              }).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });

            test('with quote', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, [
                [
                  'tinybase_values',
                  'CREATE TABLE "tinybase_values"("row ""id""" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{'row "id"': '_', v1: 1, v2: 2}],
                ],
              ]);
              await getPersister(store, db, {
                mode: 'tabular',
                values: {rowIdColumnName: 'row "id"'},
              }).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });
          });
        });
      });
    });

    describe('Save to empty database', () => {
      let persister: Persister;
      beforeEach(() => {
        persister = getPersister(store, db, {
          mode: 'tabular',
          tables: {save: {'*': {tableName: (tableId) => tableId}}},
          values: {save: true},
        });
      });

      test('nothing', async () => {
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
            [{_id: '_'}],
          ],
        ]);
      });

      describe('tables', () => {
        beforeEach(async () => {
          store.setTables({t1: {r1: {c1: 1}}});
          await persister.save();
        });

        test('once', async () => {
          expect(await getDatabase(db)).toEqual([
            [
              't1',
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            [
              'tinybase_values',
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
              [{_id: '_'}],
            ],
          ]);
        });

        test('then extra columns', async () => {
          store.setCell('t1', 'r1', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
          await persister.save();
          expect(await getDatabase(db)).toEqual([
            [
              't1',
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
              [
                {_id: 'r1', c1: 1, c2: 2, c3: null},
                {_id: 'r3', c1: null, c2: null, c3: 3},
              ],
            ],
            [
              'tinybase_values',
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
              [{_id: '_'}],
            ],
          ]);
        });

        test('then extra tables', async () => {
          store.setCell('t2', 'r2', 'c2', 2).setCell('t3', 'r3', 'c3', 3);
          await persister.save();
          expect(await getDatabase(db)).toEqual([
            [
              't1',
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            [
              'tinybase_values',
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
              [{_id: '_'}],
            ],
            [
              't2',
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
              [{_id: 'r2', c2: 2}],
            ],
            [
              't3',
              'CREATE TABLE "t3"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c3")',
              [{_id: 'r3', c3: 3}],
            ],
          ]);
        });

        describe('delete', () => {
          test('rows', async () => {
            const persister = getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {'*': {tableName: (tableId) => tableId}}},
              values: {save: true},
            });
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                  {_id: 'r3', c1: null, c2: null, c3: 3},
                ],
              ],
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
                [{_id: '_'}],
              ],
            ]);
            store.delCell('t1', 'r3', 'c3');
            await persister.save();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                ],
              ],
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
                [{_id: '_'}],
              ],
            ]);
          });

          test('columns (disabled)', async () => {
            const persister = getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {'*': {tableName: (tableId) => tableId}}},
              values: {save: true},
            });
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                  {_id: 'r3', c1: null, c2: null, c3: 3},
                ],
              ],
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
                [{_id: '_'}],
              ],
            ]);
            store.delCell('t1', 'r3', 'c3');
            await persister.save();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                ],
              ],
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
                [{_id: '_'}],
              ],
            ]);
          });

          test('columns (enabled)', async () => {
            const persister = getPersister(store, db, {
              mode: 'tabular',
              tables: {
                save: {
                  '*': {tableName: (tableId) => tableId, deleteColumns: true},
                },
              },
              values: {save: true},
            });
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                  {_id: 'r3', c1: null, c2: null, c3: 3},
                ],
              ],
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
                [{_id: '_'}],
              ],
            ]);
            store.delCell('t1', 'r3', 'c3');
            await persister.save();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2")',
                [
                  {_id: 'r1', c1: 1, c2: null},
                  {_id: 'r2', c1: null, c2: 2},
                ],
              ],
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
                [{_id: '_'}],
              ],
            ]);
            store.delRow('t1', 'r2');
            await persister.save();
            expect(await getDatabase(db)).toEqual([
              [
                't1',
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
              [
                'tinybase_values',
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
                [{_id: '_'}],
              ],
            ]);
          });
        });
      });

      describe('values', () => {
        beforeEach(async () => {
          store.setValues({v1: 1});
          await persister.save();
        });

        test('once', async () => {
          expect(await getDatabase(db)).toEqual([
            [
              'tinybase_values',
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
              [{_id: '_', v1: 1}],
            ],
          ]);
        });

        test('then extra values', async () => {
          store.setValue('v2', 2).setValue('v3', 3);
          await persister.save();
          expect(await getDatabase(db)).toEqual([
            [
              'tinybase_values',
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1", "v2", "v3")',
              [{_id: '_', v1: 1, v2: 2, v3: 3}],
            ],
          ]);
        });

        test('delete', async () => {
          store.setValue('v2', 2);
          await persister.save();
          expect(await getDatabase(db)).toEqual([
            [
              'tinybase_values',
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1", "v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          ]);
          store.delValue('v1');
          await persister.save();
          expect(await getDatabase(db)).toEqual([
            [
              'tinybase_values',
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v2")',
              [{_id: '_', v2: 2}],
            ],
          ]);
        });
      });

      test('both', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
      });

      test('both, change, and then load again', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
        await cmd(db, 'UPDATE t1 SET c1=? WHERE _id=?', [2, 'r1']);
        await cmd(db, 'UPDATE tinybase_values SET v1=? WHERE _id=?', [2, '_']);
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 2}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 2}],
          ],
        ]);
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });

    describe('Load from database', () => {
      let persister: Persister;
      beforeEach(() => {
        persister = getPersister(store, db, {mode: 'tabular'});
      });

      test('nothing', async () => {
        await persister.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('defaulted', async () => {
        await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('broken', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("di" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{di: 'r1', c1: 1}],
          ],
        ]);
        await persister.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('broken, can default', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("di" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{di: 'r1', c1: 1}],
          ],
        ]);
        await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('tables', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
        ]);
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      });

      test('values', async () => {
        await setDatabase(db, [
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
        await persister.load();
        expect(store.getContent()).toEqual([{}, {v1: 1}]);
      });

      test('both', async () => {
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('both, change, and then save again', async () => {
        persister = getPersister(store, db, {
          mode: 'tabular',
          tables: {save: {'*': {tableName: (tableId) => tableId}}},
          values: {save: true},
        });
        await setDatabase(db, [
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 1}],
          ],
        ]);
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        await persister.save();
        expect(await getDatabase(db)).toEqual([
          [
            't1',
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 2}],
          ],
          [
            'tinybase_values',
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 2}],
          ],
        ]);
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
          mode: 'tabular',
          tables: {save: {'*': {tableName: (tableId) => tableId}}},
          values: {save: true},
        });
        store2 = createStore();
        persister2 = getPersister(store2, db, {
          mode: 'tabular',
          tables: {save: {'*': {tableName: (tableId) => tableId}}},
          values: {save: true},
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
        store1.setCell('t1', 'r1', 'c1', 2);
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delCell('t1', 'r1', 'c2');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        store1.delRow('t1', 'r2');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}}, t2: {r1: {c1: 1}}},
          {v1: 1, v2: 2},
        ]);
        // store1.delTable('t2');
        // await pause();
        // expect(store2.getContent()).toEqual([
        //   {t1: {r1: {c1: 2}}},
        //   {v1: 1, v2: 2},
        // ]);
        store1.delValue('v2');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}}, t2: {r1: {c1: 1}}},
          {v1: 1},
        ]);
        store1.setValue('v1', 2);
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}}, t2: {r1: {c1: 1}}},
          {v1: 2},
        ]);
      });
    });
  },
);
