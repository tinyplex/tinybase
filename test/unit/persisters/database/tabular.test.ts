/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-len */
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
      skipSqlChecks,
    ],
  ) => {
    const [getDatabase, setDatabase] = getDatabaseFunctions(
      cmd,
      isPostgres,
      isPostgres,
    );

    const columnType = isPostgres ? 'text' : '';
    const encodedValue = isPostgres
      ? (v: any) => JSON.stringify(v)
      : (v: any) => v;
    const sqlCheck = (sqlLogs: [string, any[]?][], sql: [string, any[]?][]) => {
      if (!skipSqlChecks) {
        expect(sqlLogs).toEqual(sql);
      }
    };

    let db: any;
    let store: Store;

    beforeEach(async () => {
      mockFetchWasm();
      db = await getOpenDatabase();
      store = createStore();
    });

    afterEach(async () => {
      await close(db);
    });

    describe('Config', () => {
      describe('save', () => {
        beforeEach(() => {
          store
            .setTables({t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}})
            .setValues({v1: 1, v2: 2});
        });

        test('default (off)', async () => {
          await (
            await getPersister(store, db, {
              mode: 'tabular',
              autoLoadIntervalSeconds,
            })
          ).save();
          expect(await getDatabase(db)).toEqual({});
        });

        describe('tables', () => {
          test('one to one', async () => {
            await (
              await getPersister(store, db, {
                mode: 'tabular',
                tables: {save: {t1: 't1', t2: 't2'}},
                autoLoadIntervalSeconds,
              })
            ).save();
            await pause();
            expect(await getDatabase(db)).toEqual({
              t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
              t2: [{_id: columnType, c2: columnType}, [{_id: 'r2', c2: 2}]],
            });
          });
          test('one mapped', async () => {
            await (
              await getPersister(store, db, {
                mode: 'tabular',
                tables: {save: {t1: 'test_t1'}},
                autoLoadIntervalSeconds,
              })
            ).save();
            await pause();
            expect(await getDatabase(db)).toEqual({
              test_t1: [
                {_id: columnType, c1: columnType},
                [{_id: 'r1', c1: 1}],
              ],
            });
          });
          test('mix of one to one, mapped, custom ids, where condition, broken', async () => {
            store
              .setTable('t3', {r3: {c3: 3}})
              .setTable('t4', {r4: {c4: 4}})
              .setTable('t5', {r5: {c5: 5}})
              .setTable('t6', {'r6-1': {c6: 1}, 'r6-2': {c6: 0}});
            await (
              await getPersister(store, db, {
                mode: 'tabular',
                tables: {
                  save: {
                    t1: 't1',
                    t2: {tableName: 't2', rowIdColumnName: 'id2'},
                    t3: {tableName: 'test "t3"', rowIdColumnName: 'id "3"'},
                    t4: {tableName: 'tinybase_values'}, // @ts-ignore
                    t5: false,
                    t6: {
                      tableName: 't6',
                      condition: isPostgres ? '$tableName.c6 = \'1\'' : '$tableName.c6 = 1',
                    },
                  },
                  autoLoadIntervalSeconds,
                },
              })
            ).save();
            await pause();
            expect(await getDatabase(db)).toEqual({
              t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
              t2: [{id2: columnType, c2: columnType}, [{id2: 'r2', c2: 2}]],
              'test "t3"': [
                {'id "3"': columnType, c3: columnType},
                [{'id "3"': 'r3', c3: 3}],
              ],
              t6: [
                {_id: columnType, c6: columnType},
                [
                  {_id: 'r6-1', c6: 1},
                  {_id: 'r6-2', c6: 0},
                ],
              ],
            });
          });
        });

        describe('values', () => {
          test('on', async () => {
            await (
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true},
                autoLoadIntervalSeconds,
              })
            ).save();
            await pause();
            expect(await getDatabase(db)).toEqual({
              tinybase_values: [
                {_id: columnType, v1: columnType, v2: columnType},
                [{_id: '_', v1: 1, v2: 2}],
              ],
            });
          });

          describe('tableName', () => {
            test('as string', async () => {
              await (
                await getPersister(store, db, {
                  mode: 'tabular',
                  values: {save: true, tableName: 'values'},
                  autoLoadIntervalSeconds,
                })
              ).save();
              expect(await getDatabase(db)).toEqual({
                values: [
                  {_id: columnType, v1: columnType, v2: columnType},
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
            });

            test('with space', async () => {
              await (
                await getPersister(store, db, {
                  mode: 'tabular',
                  values: {save: true, tableName: 'tinybase values'},
                  autoLoadIntervalSeconds,
                })
              ).save();
              expect(await getDatabase(db)).toEqual({
                'tinybase values': [
                  {_id: columnType, v1: columnType, v2: columnType},
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
            });

            test('with quote', async () => {
              await (
                await getPersister(store, db, {
                  mode: 'tabular',
                  values: {save: true, tableName: 'tinybase "values"'},
                  autoLoadIntervalSeconds,
                })
              ).save();
              expect(await getDatabase(db)).toEqual({
                'tinybase "values"': [
                  {_id: columnType, v1: columnType, v2: columnType},
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
            });
          });
        });
      });

      describe('load', () => {
        beforeEach(async () => {
          await setDatabase(db, {
            t1: [
              'CREATE TABLE "t1" ("_id" ' +
                columnType +
                ' PRIMARY KEY, "c1" ' +
                columnType +
                ')',
              [{_id: 'r1', c1: 1}],
            ],
            t2: [
              'CREATE TABLE "t2" ("_id" ' +
                columnType +
                ' PRIMARY KEY, "c2" ' +
                columnType +
                ')',
              [{_id: 'r2', c2: 2}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values" ("_id" ' +
                columnType +
                ' PRIMARY KEY, "v1" ' +
                columnType +
                ',"v2" ' +
                columnType +
                ')',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
        });

        test('default (off)', async () => {
          await (
            await getPersister(store, db, {
              mode: 'tabular',
              autoLoadIntervalSeconds,
            })
          ).load();
          expect(store.getContent()).toEqual([{}, {}]);
        });

        describe('tables', () => {
          test('one to one', async () => {
            await (
              await getPersister(store, db, {
                mode: 'tabular',
                tables: {load: {t1: 't1', t2: 't2'}},
                autoLoadIntervalSeconds,
              })
            ).load();
            expect(store.getContent()).toEqual([
              {t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}},
              {},
            ]);
          });
          test('one mapped', async () => {
            await (
              await getPersister(store, db, {
                mode: 'tabular',
                tables: {load: {t1: 'test_t1'}},
                autoLoadIntervalSeconds,
              })
            ).load();
            expect(store.getContent()).toEqual([{test_t1: {r1: {c1: 1}}}, {}]);
          });
          test('mix of one to one, mapped, custom ids, where condition, broken', async () => {
            const db = await getOpenDatabase();
            await setDatabase(db, {
              t1: [
                'CREATE TABLE "t1" ("_id" ' +
                  columnType +
                  ' PRIMARY KEY, "c1" ' +
                  columnType +
                  ')',
                [{_id: 'r1', c1: 1}],
              ],
              t2: [
                'CREATE TABLE "t2"("id2" ' +
                  columnType +
                  ' PRIMARY KEY, "c2" ' +
                  columnType +
                  ')',
                [{id2: 'r2', c2: 2}],
              ],
              t3: [
                'CREATE TABLE "t3"("id ""3""" ' +
                  columnType +
                  ' PRIMARY KEY, "c3" ' +
                  columnType +
                  ')',
                [{'id "3"': 'r3', c3: 3}],
              ],
              t4: [
                'CREATE TABLE "t4" ("_id" ' +
                  columnType +
                  ' PRIMARY KEY, "c4" ' +
                  columnType +
                  ')',
                [{_id: 'r4', c4: 4}],
              ],
              t5: [
                'CREATE TABLE "t5" ("_id" ' +
                  columnType +
                  ' PRIMARY KEY, "c5" ' +
                  columnType +
                  ')',
                [{_id: 'r5', c5: 5}],
              ],
              t6: [
                'CREATE TABLE "t6" ("_id" ' +
                  columnType +
                  ' PRIMARY KEY, "c6" ' +
                  columnType +
                  ')',
                [
                  {_id: 'r6-1', c6: 1},
                  {_id: 'r6-2', c6: 0},
                ],
              ],
              tinybase_values: [
                'CREATE TABLE "tinybase_values" ("_id" ' +
                  columnType +
                  ' PRIMARY KEY, "v1" ' +
                  columnType +
                  ',"v2" ' +
                  columnType +
                  ')',
                [{_id: '_', v1: 1, v2: 2}],
              ],
            });
            await (
              await getPersister(store, db, {
                mode: 'tabular',
                tables: {
                  load: {
                    t1: 't1',
                    t2: {tableId: 't2', rowIdColumnName: 'id2'},
                    t3: {tableId: 'test "t3"', rowIdColumnName: 'id "3"'},
                    t4: {tableId: 'tinybase_values'}, // @ts-ignore
                    t5: false,
                    t6: {
                      tableId: 't6',
                      condition: isPostgres ? '$tableName.c6 = \'1\'' : '$tableName.c6 = 1',
                    },
                    tinybase_values: {tableId: 'values'},
                  },
                },
                autoLoadIntervalSeconds,
              })
            ).load();
            expect(store.getContent()).toEqual([
              {
                t1: {r1: {c1: 1}},
                t2: {r2: {c2: 2}},
                'test "t3"': {r3: {c3: 3}},
                t6: {'r6-1': {c6: 1}},
                tinybase_values: {r4: {c4: 4}},
              },
              {},
            ]);
            await close(db);
          });
        });

        describe('values', () => {
          test('on', async () => {
            await (
              await getPersister(store, db, {
                mode: 'tabular',
                values: {load: true},
                autoLoadIntervalSeconds,
              })
            ).load();
            expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
          });

          describe('tableName', () => {
            test('as string', async () => {
              await setDatabase(db, {
                values: [
                  'CREATE TABLE "values" ("_id" ' +
                    columnType +
                    ' PRIMARY KEY, "v1" ' +
                    columnType +
                    ',"v2" ' +
                    columnType +
                    ')',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
              await (
                await getPersister(store, db, {
                  mode: 'tabular',
                  values: {load: true, tableName: 'values'},
                  autoLoadIntervalSeconds,
                })
              ).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });

            test('with space', async () => {
              await setDatabase(db, {
                'tinybase values': [
                  'CREATE TABLE "tinybase values" ("_id" ' +
                    columnType +
                    ' PRIMARY KEY, "v1" ' +
                    columnType +
                    ',"v2" ' +
                    columnType +
                    ')',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
              await (
                await getPersister(store, db, {
                  mode: 'tabular',
                  values: {load: true, tableName: 'tinybase values'},
                  autoLoadIntervalSeconds,
                })
              ).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });

            test('with quote', async () => {
              await setDatabase(db, {
                'tinybase "values"': [
                  'CREATE TABLE "tinybase ""values""" ("_id" ' +
                    columnType +
                    ' PRIMARY KEY, "v1" ' +
                    columnType +
                    ',"v2" ' +
                    columnType +
                    ')',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
              await (
                await getPersister(store, db, {
                  mode: 'tabular',
                  values: {load: true, tableName: 'tinybase "values"'},
                  autoLoadIntervalSeconds,
                })
              ).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });
          });
        });
      });
    });

    describe('Save to empty database', () => {
      let persister: Persister;
      beforeEach(async () => {
        persister = await getPersister(store, db, {
          mode: 'tabular',
          tables: {
            load: {t1: 't1', t2: 't2', t3: 't3'},
            save: {t1: 't1', t2: 't2', t3: 't3'},
          },
          values: {load: true, save: true},
          autoLoadIntervalSeconds,
        });
      });

      test('nothing', async () => {
        await persister.save();
        expect(await getDatabase(db)).toEqual({});
      });

      describe('tables', () => {
        beforeEach(async () => {
          store.setTables({t1: {r1: {c1: 1}}});
          await persister.save();
        });

        test('once', async () => {
          expect(await getDatabase(db)).toEqual({
            t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
          });
        });

        test('all types', async () => {
          store.setTables({t1: {r1: {c1: 1, c2: 'two', c3: true}}});
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType, c3: columnType},
              [{_id: 'r1', c1: 1, c2: 'two', c3: isPostgres ? true : 1}],
            ],
          });
        });

        test('then extra columns', async () => {
          store
            .setCell('t1', 'r1', 'c2', 'two')
            .setCell('t1', 'r3', 'c3', true)
            .setCell('t1', 'r3', 'c4', false);
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {
                _id: columnType,
                c1: columnType,
                c2: columnType,
                c3: columnType,
                c4: columnType,
              },
              [
                {_id: 'r1', c1: 1, c2: 'two', c3: null, c4: null},
                {
                  _id: 'r3',
                  c1: null,
                  c2: null,
                  c3: isPostgres ? true : 1,
                  c4: isPostgres ? false : 0,
                },
                // SQLite can't store booleans
              ],
            ],
          });
        });

        test('then extra tables', async () => {
          store
            .setCell('t2', 'r2', 'c2', 'two')
            .setCell('t3', 'r3', 'c3', true);
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            t2: [{_id: columnType, c2: columnType}, [{_id: 'r2', c2: 'two'}]],
            t3: [
              {_id: columnType, c3: columnType},
              [{_id: 'r3', c3: isPostgres ? true : 1}],
            ],
          });
        });

        describe('delete', () => {
          test('rows', async () => {
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                {
                  _id: columnType,
                  c1: columnType,
                  c2: columnType,
                  c3: columnType,
                },
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                  {_id: 'r3', c1: null, c2: null, c3: 3},
                ],
              ],
            });
            store.delCell('t1', 'r3', 'c3');
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                {
                  _id: columnType,
                  c1: columnType,
                  c2: columnType,
                  c3: columnType,
                },
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                ],
              ],
            });
          });

          test('rows (with where condition)', async () => {
            store
              .setCell('t1', 'r2', 'c0', 1)
              .setCell('t1', 'r2', 'c2', 2)
              .setCell('t1', 'r3', 'c0', 0)
              .setCell('t1', 'r3', 'c3', 3);
            const persister = await getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {t1: {tableName: 't1', condition: isPostgres ? '$tableName.c0 = \'1\'' : '$tableName.c0 = 1'}}},
              values: {save: true},
              autoLoadIntervalSeconds,
            });
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                {
                  _id: columnType,
                  c1: columnType,
                  c2: columnType,
                  c3: columnType,
                  c0: columnType,
                },
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null, c0: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null, c0: 1},
                  {_id: 'r3', c1: null, c2: null, c3: 3, c0: 0},
                ],
              ],
            });
            store.delRow('t1', 'r2').delRow('t1', 'r3');
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                {
                  _id: columnType,
                  c1: columnType,
                  c2: columnType,
                  c3: columnType,
                  c0: columnType,
                },
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null, c0: null},
                  {_id: 'r3', c1: null, c2: null, c3: 3, c0: 0},
                ],
              ],
            });
          });

          test('columns (disabled)', async () => {
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                {
                  _id: columnType,
                  c1: columnType,
                  c2: columnType,
                  c3: columnType,
                },
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                  {_id: 'r3', c1: null, c2: null, c3: 3},
                ],
              ],
            });
            store.delCell('t1', 'r3', 'c3');
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                {
                  _id: columnType,
                  c1: columnType,
                  c2: columnType,
                  c3: columnType,
                },
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                ],
              ],
            });
          });

          test('columns (enabled)', async () => {
            const persister = await getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {t1: {tableName: 't1', deleteEmptyColumns: true}}},
              values: {save: true},
              autoLoadIntervalSeconds,
            });
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                {
                  _id: columnType,
                  c1: columnType,
                  c2: columnType,
                  c3: columnType,
                },
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                  {_id: 'r3', c1: null, c2: null, c3: 3},
                ],
              ],
            });
            store.delCell('t1', 'r3', 'c3');
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                {_id: columnType, c1: columnType, c2: columnType},
                [
                  {_id: 'r1', c1: 1, c2: null},
                  {_id: 'r2', c1: null, c2: 2},
                ],
              ],
            });
            store.delRow('t1', 'r2');
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            });
          });

          test('tables (disabled)', async () => {
            const persister = await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                save: {
                  t1: 't1',
                  t2: 't2',
                  t3: {tableName: 't3', deleteEmptyColumns: true},
                },
              },
              values: {save: true},
              autoLoadIntervalSeconds,
            });
            store.setCell('t2', 'r2', 'c2', 2).setCell('t3', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
              t2: [{_id: columnType, c2: columnType}, [{_id: 'r2', c2: 2}]],
              t3: [{_id: columnType, c3: columnType}, [{_id: 'r3', c3: 3}]],
            });
            store.delTables();
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [{_id: columnType, c1: columnType}, []],
              t2: [{_id: columnType, c2: columnType}, []],
              t3: [{_id: columnType}, []],
            });
          });

          test('tables (enabled)', async () => {
            const persister = await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                save: {
                  t1: 't1',
                  t2: 't2',
                  t3: {tableName: 't3', deleteEmptyTable: true},
                },
              },
              values: {save: true},
              autoLoadIntervalSeconds,
            });
            store.setCell('t2', 'r2', 'c2', 2).setCell('t3', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
              t2: [{_id: columnType, c2: columnType}, [{_id: 'r2', c2: 2}]],
              t3: [{_id: columnType, c3: columnType}, [{_id: 'r3', c3: 3}]],
            });
            store.delTables();
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [{_id: columnType, c1: columnType}, []],
              t2: [{_id: columnType, c2: columnType}, []],
            });
          });
        });
      });

      describe('values', () => {
        beforeEach(async () => {
          store.setValues({v1: 1});
          await persister.save();
        });

        test('once', async () => {
          expect(await getDatabase(db)).toEqual({
            tinybase_values: [
              {_id: columnType, v1: columnType},
              [{_id: '_', v1: 1}],
            ],
          });
        });

        test('then extra values', async () => {
          store.setValue('v2', 2).setValue('v3', 3);
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType, v3: columnType},
              [{_id: '_', v1: 1, v2: 2, v3: 3}],
            ],
          });
        });

        test('delete', async () => {
          store.setValue('v2', 2);
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          store.delValue('v1');
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            tinybase_values: [
              {_id: columnType, v2: columnType},
              [{_id: '_', v2: 2}],
            ],
          });
        });
      });

      test('both', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
          tinybase_values: [
            {_id: columnType, v1: columnType},
            [{_id: '_', v1: 1}],
          ],
        });
      });

      test('both, change, and then load again', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
          tinybase_values: [
            {_id: columnType, v1: columnType},
            [{_id: '_', v1: 1}],
          ],
        });
        await cmd(db, 'UPDATE t1 SET c1=$1 WHERE _id=$2', [2, 'r1']);
        await cmd(db, 'UPDATE tinybase_values SET v1=$1 WHERE _id=$2', [
          2,
          '_',
        ]);
        expect(await getDatabase(db)).toEqual({
          t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 2}]],
          tinybase_values: [
            {_id: columnType, v1: columnType},
            [{_id: '_', v1: 2}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });

    describe('Load from database', () => {
      let persister: Persister;
      beforeEach(async () => {
        persister = await getPersister(store, db, {
          mode: 'tabular',
          tables: {
            load: {t1: 't1', t2: 't2', t3: 't3'},
            save: {t1: 't1', t2: 't2', t3: 't3'},
          },
          values: {load: true, save: true},
          autoLoadIntervalSeconds,
        }, undefined, (err) => console.error(err));
      });

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
          t1: [
            'CREATE TABLE "t1"("di" ' +
              columnType +
              ' PRIMARY KEY, "c1" ' +
              columnType +
              ')',
            [{di: 'r1', c1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('broken, can default', async () => {
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1"("di" ' +
              columnType +
              ' PRIMARY KEY, "c1" ' +
              columnType +
              ')',
            [{di: 'r1', c1: 1}],
          ],
        });
        await persister.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('tables', async () => {
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "c1" ' +
              columnType +
              ')',
            [{_id: 'r1', c1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      });

      test('values', async () => {
        await setDatabase(db, {
          tinybase_values: [
            'CREATE TABLE "tinybase_values" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "v1" ' +
              columnType +
              ')',
            [{_id: '_', v1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{}, {v1: 1}]);
      });

      describe('both', () => {
        beforeEach(async () => {
          await setDatabase(db, {
            t1: [
              'CREATE TABLE "t1" ("_id" ' +
                columnType +
                ' PRIMARY KEY, "c1" ' +
                columnType +
                ')',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values" ("_id" ' +
                columnType +
                ' PRIMARY KEY, "v1" ' +
                columnType +
                ')',
              [{_id: '_', v1: 1}],
            ],
          });
        });

        test('check', async () => {
          await persister.load();
          expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        });

        test('then delete rows', async () => {
          await persister.load();
          await cmd(db, 'DELETE from t1');
          await persister.load();
          expect(store.getContent()).toEqual([{}, {v1: 1}]);
        });

        test('then drop table', async () => {
          await persister.load();
          await cmd(db, 'DROP TABLE t1');
          await persister.load();
          expect(store.getContent()).toEqual([{}, {v1: 1}]);
        });
      });

      test('both, change, and then save again', async () => {
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "c1" ' +
              columnType +
              ')',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "v1" ' +
              columnType +
              ')',
            [{_id: '_', v1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 2}]],
          tinybase_values: [
            {_id: columnType, v1: columnType},
            [{_id: '_', v1: 2}],
          ],
        });
      });

      test('no conflict key, both, change, and then save again', async () => {
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "c1" ' +
              columnType +
              ')',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "v1" ' +
              columnType +
              ')',
            [{_id: '_', v1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          t1: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 2}]],
          tinybase_values: [
            {_id: columnType, v1: columnType},
            [{_id: '_', v1: 2}],
          ],
        });
      });

      test('autoLoad', async () => {
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "c1" ' +
              columnType +
              ')',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "v1" ' +
              columnType +
              ')',
            [{_id: '_', v1: 1}],
          ],
        });
        await persister.startAutoLoad();
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        }, 1000);
        await cmd(db, 'UPDATE t1 SET c1=$1 WHERE _id=$2', [2, 'r1']);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
        }, 1000);
        await cmd(db, 'UPDATE tinybase_values SET v1=$1 WHERE _id=$2', [
          2,
          '_',
        ]);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        }, 1000);
      });

      test('autoLoad, table dropped and recreated', async () => {
        // if (name == 'pglite') {
        //   return;
        // }
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "c1" ' +
              columnType +
              ')',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values" ("_id" ' +
              columnType +
              ' PRIMARY KEY, "v1" ' +
              columnType +
              ')',
            [{_id: '_', v1: 1}],
          ],
        });
        await persister.startAutoLoad();
        await pause(autoLoadPause);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        await cmd(db, 'DROP TABLE t1');
        await cmd(
          db,
          'CREATE TABLE "t1" ("_id" ' +
            columnType +
            ' PRIMARY KEY, "c1" ' +
            columnType +
            ')',
        );
        await cmd(db, 'INSERT INTO t1 (_id, c1) VALUES ($1, $2)', ['r1', 3]);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store.getContent()).toEqual([{t1: {r1: {c1: 3}}}, {v1: 1}]);
        }, 1000);
        await cmd(db, 'DROP TABLE tinybase_values');
        await cmd(
          db,
          'CREATE TABLE "tinybase_values" ("_id" ' +
            columnType +
            ' PRIMARY KEY, "v1" ' +
            columnType +
            ')',
        );
        await cmd(db, 'INSERT INTO tinybase_values (_id, v1) VALUES ($1, $2)', [
          '_',
          3,
        ]);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store.getContent()).toEqual([{t1: {r1: {c1: 3}}}, {v1: 3}]);
        }, 1000);
        await cmd(db, 'UPDATE t1 SET c1 = $1 WHERE _id = $2', [4, 'r1']);
        await cmd(db, 'UPDATE tinybase_values SET v1 = $1 WHERE _id = $2', [
          4,
          '_',
        ]);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store.getContent()).toEqual([{t1: {r1: {c1: 4}}}, {v1: 4}]);
        }, 1000);
      });
    });

    describe('SQL for granular saves', () => {
      let persister: Persister;
      const sqlLogs: [string, any[]?][] = [];
      beforeEach(async () => {
        persister = await getPersister(
          store,
          db,
          {
            mode: 'tabular',
            tables: {
              load: {t1: 't1', t2: 't2', t3: 't3'},
              save: {t1: 't1', t2: 't2', t3: 't3'},
            },
            values: {load: true, save: true},
            autoLoadIntervalSeconds,
          },
          (sql: string, args?: any[]) => {
            if (
              !sql.includes('pragma_table_list') &&
              !sql.includes('information_schema')
            ) {
              sqlLogs.push([sql, args]);
            }
          },
        );
        store
          .setTables({
            t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1, c2: 2}},
            t2: {r1: {c1: 1}},
          })
          .setValues({v1: 1, v2: 2});
        await persister.startAutoSave();
      });

      test('initial conditions', async () => {
        expect(await getDatabase(db)).toEqual({
          t1: [
            {_id: columnType, c1: columnType, c2: columnType},
            [
              {_id: 'r1', c1: 1, c2: 2},
              {_id: 'r2', c1: 1, c2: 2},
            ],
          ],
          t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
          tinybase_values: [
            {_id: columnType, v1: columnType, v2: columnType},
            [{_id: '_', v1: 1, v2: 2}],
          ],
        });
        sqlCheck(sqlLogs, [
          ['BEGIN', undefined],
          [
            'CREATE TABLE"t1"("_id"' +
              columnType +
              ' PRIMARY KEY,"c1"' +
              columnType +
              ',"c2"' +
              columnType +
              ');',
            undefined,
          ],
          [
            'CREATE TABLE"t2"("_id"' +
              columnType +
              ' PRIMARY KEY,"c1"' +
              columnType +
              ');',
            undefined,
          ],
          [
            'INSERT INTO"t1"("_id","c1","c2")VALUES($1,$2,$3),($4,$5,$6)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1","c2"=excluded."c2"',
            [
              'r1',
              encodedValue(1),
              encodedValue(2),
              'r2',
              encodedValue(1),
              encodedValue(2),
            ],
          ],
          [
            'INSERT INTO"t2"("_id","c1")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
            ['r1', encodedValue(1)],
          ],
          ['DELETE FROM"t1"WHERE"_id"NOT IN($1,$2) AND ( true)', ['r1', 'r2']],
          ['DELETE FROM"t2"WHERE"_id"NOT IN($1) AND ( true)', ['r1']],
          [
            'CREATE TABLE"tinybase_values"("_id"' +
              columnType +
              ' PRIMARY KEY,"v1"' +
              columnType +
              ',"v2"' +
              columnType +
              ');',
            undefined,
          ],
          [
            'INSERT INTO"tinybase_values"("_id","v1","v2")VALUES($1,$2,$3)ON CONFLICT("_id")DO UPDATE SET"v1"=excluded."v1","v2"=excluded."v2"',
            ['_', encodedValue(1), encodedValue(2)],
          ],
          ['DELETE FROM"tinybase_values"WHERE"_id"NOT IN($1) AND ( true)', ['_']],
          ['END', undefined],
        ]);
      });

      describe('values', () => {
        beforeEach(() => sqlLogs.splice(0));

        test('add', async () => {
          store.setValue('v3', 3);
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType, v3: columnType},
              [{_id: '_', v1: 1, v2: 2, v3: 3}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            ['ALTER TABLE"tinybase_values"ADD"v3"' + columnType, undefined],
            [
              'INSERT INTO"tinybase_values"("_id","v3")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"v3"=excluded."v3"',
              ['_', encodedValue(3)],
            ],
            ['END', undefined],
          ]);
        });

        test('change', async () => {
          store.setValue('v1', 2);
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 2, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            [
              'INSERT INTO"tinybase_values"("_id","v1")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"v1"=excluded."v1"',
              ['_', encodedValue(2)],
            ],
            ['END', undefined],
          ]);
        });

        test('delete', async () => {
          store.delValue('v1');
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: null, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            [
              'INSERT INTO"tinybase_values"("_id","v1")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"v1"=excluded."v1"',
              ['_', null],
            ],
            ['END', undefined],
          ]);
        });

        test('delete all', async () => {
          store.delValues();
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: null, v2: null}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            [
              'INSERT INTO"tinybase_values"("_id","v1","v2")VALUES($1,$2,$3)ON CONFLICT("_id")DO UPDATE SET"v1"=excluded."v1","v2"=excluded."v2"',
              ['_', null, null],
            ],
            ['END', undefined],
          ]);
        });
      });

      describe('cells', () => {
        beforeEach(() => sqlLogs.splice(0));

        test('add', async () => {
          store.setCell('t1', 'r1', 'c3', 3);
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType, c3: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2, c3: 3},
                {_id: 'r2', c1: 1, c2: 2, c3: null},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            ['ALTER TABLE"t1"ADD"c3"' + columnType, undefined],
            [
              'INSERT INTO"t1"("_id","c3")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"c3"=excluded."c3"',
              ['r1', encodedValue(3)],
            ],
            ['END', undefined],
          ]);
        });

        test('change', async () => {
          store.setCell('t1', 'r1', 'c1', 2);
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 2, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            [
              'INSERT INTO"t1"("_id","c1")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
              ['r1', encodedValue(2)],
            ],
            ['END', undefined],
          ]);
        });

        test('delete', async () => {
          store.delCell('t1', 'r1', 'c1');
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: null, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            [
              'INSERT INTO"t1"("_id","c1")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
              ['r1', null],
            ],
            ['END', undefined],
          ]);
        });
      });

      describe('rows', () => {
        beforeEach(() => sqlLogs.splice(0));

        test('add', async () => {
          store.setRow('t1', 'r3', {c1: 1, c3: 3});
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType, c3: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2, c3: null},
                {_id: 'r2', c1: 1, c2: 2, c3: null},
                {_id: 'r3', c1: 1, c2: null, c3: 3},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            ['ALTER TABLE"t1"ADD"c3"' + columnType, undefined],
            [
              'INSERT INTO"t1"("_id","c1","c3")VALUES($1,$2,$3)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1","c3"=excluded."c3"',
              ['r3', encodedValue(1), encodedValue(3)],
            ],
            ['END', undefined],
          ]);
        });

        test('change', async () => {
          store.setRow('t1', 'r1', {c1: 2, c2: 2});
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 2, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            [
              'INSERT INTO"t1"("_id","c1")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
              ['r1', encodedValue(2)],
            ],
            ['END', undefined],
          ]);
        });

        test('delete', async () => {
          store.delRow('t1', 'r1');
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [{_id: 'r2', c1: 1, c2: 2}],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            ['DELETE FROM"t1"WHERE ("_id"=$1) AND ( true)', ['r1']],
            ['END', undefined],
          ]);
        });
      });

      describe('tables', () => {
        beforeEach(() => sqlLogs.splice(0));

        test('add', async () => {
          store.setTable('t3', {r1: {c1: 1}});
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            t3: [{_id: columnType, c1: columnType}, [{_id: 'r1', c1: 1}]],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            [
              'CREATE TABLE"t3"("_id"' +
                columnType +
                ' PRIMARY KEY,"c1"' +
                columnType +
                ');',
              undefined,
            ],
            [
              'INSERT INTO"t3"("_id","c1")VALUES($1,$2)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
              ['r1', encodedValue(1)],
            ],
            ['END', undefined],
          ]);
        });

        test('change', async () => {
          store.setTable('t2', {r1: {c1: 2, c2: 2}});
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              {_id: columnType, c1: columnType, c2: columnType},
              [{_id: 'r1', c1: 2, c2: 2}],
            ],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            ['ALTER TABLE"t2"ADD"c2"' + columnType, undefined],
            [
              'INSERT INTO"t2"("_id","c1","c2")VALUES($1,$2,$3)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1","c2"=excluded."c2"',
              ['r1', encodedValue(2), encodedValue(2)],
            ],
            ['END', undefined],
          ]);
        });

        test('delete', async () => {
          store.delTable('t2');
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              {_id: columnType, c1: columnType, c2: columnType},
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [{_id: columnType, c1: columnType}, []],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            ['DELETE FROM"t2"WHERE true', undefined],
            ['END', undefined],
          ]);
        });

        test('delete all', async () => {
          store.delTables();
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [{_id: columnType, c1: columnType, c2: columnType}, []],
            t2: [{_id: columnType, c1: columnType}, []],
            tinybase_values: [
              {_id: columnType, v1: columnType, v2: columnType},
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          sqlCheck(sqlLogs, [
            ['BEGIN', undefined],
            ['DELETE FROM"t1"WHERE true', undefined],
            ['DELETE FROM"t2"WHERE true', undefined],
            ['END', undefined],
          ]);
        });
      });
    });

    describe('Two stores, one connection, one database', () => {
      let store1: Store;
      let persister1: Persister;
      let store2: Store;
      let persister2: Persister;

      beforeEach(async () => {
        store1 = createStore();
        persister1 = await getPersister(store1, db, {
          mode: 'tabular',
          tables: {load: {t1: 't1', t2: 't2'}, save: {t1: 't1', t2: 't2'}},
          values: {load: true, save: true},
          autoLoadIntervalSeconds,
        });
        store2 = createStore();
        persister2 = await getPersister(store2, db, {
          mode: 'tabular',
          tables: {load: {t1: 't1', t2: 't2'}, save: {t1: 't1', t2: 't2'}},
          values: {load: true, save: true},
          autoLoadIntervalSeconds,
        });
      });

      afterEach(async () => {
        persister1.destroy();
        persister2.destroy();
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
        await pause(autoLoadPause);
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        await pause(autoLoadPause);
        // todo this is failing
        await waitFor(() => {
          expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        }, 1000);
      });

      test('autoSave1 & autoLoad2', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        }, 1000);
      });

      test('autoSave1 & autoLoad2, complex transactions', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store1.setContent([
          {
            t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
            t2: {r1: {c1: 1}},
          },
          {v1: 1, v2: 2},
        ]);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store1.setCell('t1', 'r1', 'c1', 2);
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 2, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store1.delCell('t1', 'r1', 'c2');
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store1.delRow('t1', 'r2');
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 2}}, t2: {r1: {c1: 1}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store1.delTable('t2');
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([
            {t1: {r1: {c1: 2}}},
            {v1: 1, v2: 2},
          ]);
        }, 1000);
        store1.delValue('v2');
        await pause(autoLoadPause);
        await waitFor(() => {
          expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
        }, 1000);
        store1.setValue('v1', 2);
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

      let store1: Store;
      let persister1: Persister;
      let db2: any;
      let store2: Store;
      let persister2: Persister;

      beforeEach(async () => {
        store1 = createStore();
        persister1 = await getPersister(store1, db, {
          mode: 'tabular',
          tables: {load: {t1: 't1', t2: 't2'}, save: {t1: 't1', t2: 't2'}},
          values: {load: true, save: true},
          autoLoadIntervalSeconds,
        });
        db2 = await getOpenDatabase(db);
        store2 = createStore();
        persister2 = await getPersister(store2, db2, {
          mode: 'tabular',
          tables: {load: {t1: 't1', t2: 't2'}, save: {t1: 't1', t2: 't2'}},
          values: {load: true, save: true},
          autoLoadIntervalSeconds,
        });
      });

      afterEach(async () => {
        persister1.destroy();
        persister2.destroy();
        await close(db2);
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
        await pause(autoLoadPause);
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister1.save();
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await pause(autoLoadPause);
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('autoSave1 & autoLoad2, complex transactions', async () => {
        await persister1.startAutoSave();
        await persister2.startAutoLoad();
        await pause(autoLoadPause);
        store1.setContent([
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
  },
);
