/* eslint-disable @typescript-eslint/ban-ts-comment */
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
          await getPersister(store, db, {
            mode: 'tabular',
            autoLoadIntervalSeconds,
          }).save();
          expect(await getDatabase(db)).toEqual({});
        });

        describe('tables', () => {
          test('one to one', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {t1: 't1', t2: 't2'}},
              autoLoadIntervalSeconds,
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual({
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
              t2: [
                'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [{_id: 'r2', c2: 2}],
              ],
            });
          });
          test('one mapped', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {t1: 'test_t1'}},
              autoLoadIntervalSeconds,
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual({
              test_t1: [
                'CREATE TABLE "test_t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
            });
          });
          test('mix of one to one, mapped, custom ids, broken', async () => {
            store
              .setTable('t3', {r3: {c3: 3}})
              .setTable('t4', {r4: {c4: 4}})
              .setTable('t5', {r5: {c5: 5}});
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                save: {
                  t1: 't1',
                  t2: {tableName: 't2', rowIdColumnName: 'id2'},
                  t3: {tableName: 'test "t3"', rowIdColumnName: 'id "3"'},
                  t4: {tableName: 'tinybase_values'}, // @ts-ignore
                  t5: false,
                },
                autoLoadIntervalSeconds,
              },
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual({
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
              t2: [
                'CREATE TABLE "t2"("id2" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [{id2: 'r2', c2: 2}],
              ],
              'test "t3"': [
                'CREATE TABLE "test ""t3"""("id ""3""" PRIMARY KEY ON CONFLICT REPLACE,"c3")',
                [{'id "3"': 'r3', c3: 3}],
              ],
            });
          });
        });

        describe('values', () => {
          test('on', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              values: {save: true},
              autoLoadIntervalSeconds,
            }).save();
            await pause();
            expect(await getDatabase(db)).toEqual({
              tinybase_values: [
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                [{_id: '_', v1: 1, v2: 2}],
              ],
            });
          });

          describe('tableName', () => {
            test('as string', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, tableName: 'values'},
                autoLoadIntervalSeconds,
              }).save();
              expect(await getDatabase(db)).toEqual({
                values: [
                  'CREATE TABLE "values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
            });

            test('with space', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, tableName: 'tinybase values'},
                autoLoadIntervalSeconds,
              }).save();
              expect(await getDatabase(db)).toEqual({
                'tinybase values': [
                  'CREATE TABLE "tinybase values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
            });

            test('with quote', async () => {
              await getPersister(store, db, {
                mode: 'tabular',
                values: {save: true, tableName: 'tinybase "values"'},
                autoLoadIntervalSeconds,
              }).save();
              expect(await getDatabase(db)).toEqual({
                'tinybase "values"': [
                  'CREATE TABLE "tinybase ""values"""("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
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
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
              [{_id: 'r2', c2: 2}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
        });

        test('default (off)', async () => {
          await getPersister(store, db, {
            mode: 'tabular',
            autoLoadIntervalSeconds,
          }).load();
          expect(store.getContent()).toEqual([{}, {}]);
        });

        describe('tables', () => {
          test('one to one', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {load: {t1: 't1', t2: 't2'}},
              autoLoadIntervalSeconds,
            }).load();
            expect(store.getContent()).toEqual([
              {t1: {r1: {c1: 1}}, t2: {r2: {c2: 2}}},
              {},
            ]);
          });
          test('one mapped', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {load: {t1: 'test_t1'}},
              autoLoadIntervalSeconds,
            }).load();
            expect(store.getContent()).toEqual([{test_t1: {r1: {c1: 1}}}, {}]);
          });
          test('mix of one to one, mapped, custom ids, broken', async () => {
            db = await getOpenDatabase();
            await setDatabase(db, {
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
              t2: [
                'CREATE TABLE "t2"("id2" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [{id2: 'r2', c2: 2}],
              ],
              t3: [
                'CREATE TABLE "t3"("id ""3""" PRIMARY KEY ON CONFLICT REPLACE,"c3")',
                [{'id "3"': 'r3', c3: 3}],
              ],
              t4: [
                'CREATE TABLE "t4"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c4")',
                [{_id: 'r4', c4: 4}],
              ],
              t5: [
                'CREATE TABLE "t5"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c5")',
                [{_id: 'r5', c5: 5}],
              ],
              tinybase_values: [
                'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                [{_id: '_', v1: 1, v2: 2}],
              ],
            });
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {
                load: {
                  t1: 't1',
                  t2: {tableId: 't2', rowIdColumnName: 'id2'},
                  t3: {tableId: 'test "t3"', rowIdColumnName: 'id "3"'},
                  t4: {tableId: 'tinybase_values'}, // @ts-ignore
                  t5: false,
                  tinybase_values: {tableId: 'values'},
                },
              },
              autoLoadIntervalSeconds,
            }).load();
            expect(store.getContent()).toEqual([
              {
                t1: {r1: {c1: 1}},
                t2: {r2: {c2: 2}},
                'test "t3"': {r3: {c3: 3}},
                tinybase_values: {r4: {c4: 4}},
              },
              {},
            ]);
          });
        });

        describe('values', () => {
          test('on', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              values: {load: true},
              autoLoadIntervalSeconds,
            }).load();
            expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
          });

          describe('tableName', () => {
            test('as string', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, {
                values: [
                  'CREATE TABLE "values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
              await getPersister(store, db, {
                mode: 'tabular',
                values: {load: true, tableName: 'values'},
                autoLoadIntervalSeconds,
              }).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });

            test('with space', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, {
                'tinybase values': [
                  'CREATE TABLE "tinybase values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
              await getPersister(store, db, {
                mode: 'tabular',
                values: {load: true, tableName: 'tinybase values'},
                autoLoadIntervalSeconds,
              }).load();
              expect(store.getContent()).toEqual([{}, {v1: 1, v2: 2}]);
            });

            test('with quote', async () => {
              db = await getOpenDatabase();
              await setDatabase(db, {
                'tinybase "values"': [
                  'CREATE TABLE "tinybase ""values"""("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
                  [{_id: '_', v1: 1, v2: 2}],
                ],
              });
              await getPersister(store, db, {
                mode: 'tabular',
                values: {load: true, tableName: 'tinybase "values"'},
                autoLoadIntervalSeconds,
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
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
          });
        });

        test('then extra columns', async () => {
          store.setCell('t1', 'r1', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
              [
                {_id: 'r1', c1: 1, c2: 2, c3: null},
                {_id: 'r3', c1: null, c2: null, c3: 3},
              ],
            ],
          });
        });

        test('then extra tables', async () => {
          store.setCell('t2', 'r2', 'c2', 2).setCell('t3', 'r3', 'c3', 3);
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
              [{_id: 'r2', c2: 2}],
            ],
            t3: [
              'CREATE TABLE "t3"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c3")',
              [{_id: 'r3', c3: 3}],
            ],
          });
        });

        describe('delete', () => {
          test('rows', async () => {
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
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
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                ],
              ],
            });
          });

          test('columns (disabled)', async () => {
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
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
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
                [
                  {_id: 'r1', c1: 1, c2: null, c3: null},
                  {_id: 'r2', c1: null, c2: 2, c3: null},
                ],
              ],
            });
          });

          test('columns (enabled)', async () => {
            const persister = getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {t1: {tableName: 't1', deleteEmptyColumns: true}}},
              values: {save: true},
              autoLoadIntervalSeconds,
            });
            store.setCell('t1', 'r2', 'c2', 2).setCell('t1', 'r3', 'c3', 3);
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2", "c3")',
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
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2")',
                [
                  {_id: 'r1', c1: 1, c2: null},
                  {_id: 'r2', c1: null, c2: 2},
                ],
              ],
            });
            store.delRow('t1', 'r2');
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
            });
          });

          test('tables (disabled)', async () => {
            const persister = getPersister(store, db, {
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
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
              t2: [
                'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [{_id: 'r2', c2: 2}],
              ],
              t3: [
                'CREATE TABLE "t3"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c3")',
                [{_id: 'r3', c3: 3}],
              ],
            });
            store.delTables();
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [],
              ],
              t2: [
                'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [],
              ],
              t3: [
                'CREATE TABLE "t3"("_id" PRIMARY KEY ON CONFLICT REPLACE)',
                [],
              ],
            });
          });

          test('tables (enabled)', async () => {
            const persister = getPersister(store, db, {
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
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [{_id: 'r1', c1: 1}],
              ],
              t2: [
                'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [{_id: 'r2', c2: 2}],
              ],
              t3: [
                'CREATE TABLE "t3"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c3")',
                [{_id: 'r3', c3: 3}],
              ],
            });
            store.delTables();
            await persister.save();
            expect(await getDatabase(db)).toEqual({
              t1: [
                'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
                [],
              ],
              t2: [
                'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c2")',
                [],
              ],
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
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
              [{_id: '_', v1: 1}],
            ],
          });
        });

        test('then extra values', async () => {
          store.setValue('v2', 2).setValue('v3', 3);
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1", "v2", "v3")',
              [{_id: '_', v1: 1, v2: 2, v3: 3}],
            ],
          });
        });

        test('delete', async () => {
          store.setValue('v2', 2);
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1", "v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          store.delValue('v1');
          await persister.save();
          expect(await getDatabase(db)).toEqual({
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v2")',
              [{_id: '_', v2: 2}],
            ],
          });
        });
      });

      test('both', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          t1: [
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 1}],
          ],
        });
      });

      test('both, change, and then load again', async () => {
        store.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          t1: [
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 1}],
          ],
        });
        await cmd(db, 'UPDATE t1 SET c1=? WHERE _id=?', [2, 'r1']);
        await cmd(db, 'UPDATE tinybase_values SET v1=? WHERE _id=?', [2, '_']);
        expect(await getDatabase(db)).toEqual({
          t1: [
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 2}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 2}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });

    describe('Load from database', () => {
      let persister: Persister;
      beforeEach(() => {
        persister = getPersister(store, db, {
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
            'CREATE TABLE "t1"("di" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{di: 'r1', c1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{}, {}]);
      });

      test('broken, can default', async () => {
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1"("di" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{di: 'r1', c1: 1}],
          ],
        });
        await persister.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
      });

      test('tables', async () => {
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
      });

      test('values', async () => {
        await setDatabase(db, {
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
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
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
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
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          t1: [
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 2}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1")',
            [{_id: '_', v1: 2}],
          ],
        });
      });

      test('no conflict key, both, change, and then save again', async () => {
        await setDatabase(db, {
          t1: [
            'CREATE TABLE "t1"("_id" PRIMARY KEY,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY,"v1")',
            [{_id: '_', v1: 1}],
          ],
        });
        await persister.load();
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
        store.setCell('t1', 'r1', 'c1', 2).setValue('v1', 2);
        expect(store.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
        await persister.save();
        expect(await getDatabase(db)).toEqual({
          t1: [
            'CREATE TABLE "t1"("_id" PRIMARY KEY,"c1")',
            [{_id: 'r1', c1: 2}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY,"v1")',
            [{_id: '_', v1: 2}],
          ],
        });
      });
    });

    describe('SQL for granular saves', () => {
      let persister: Persister;
      const sqlLogs: [string, any[]?][] = [];
      beforeEach(async () => {
        persister = getPersister(
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
          (sql: string, args?: any[]) => sqlLogs.push([sql, args]),
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
            'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
            [
              {_id: 'r1', c1: 1, c2: 2},
              {_id: 'r2', c1: 1, c2: 2},
            ],
          ],
          t2: [
            'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
            [{_id: 'r1', c1: 1}],
          ],
          tinybase_values: [
            'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
            [{_id: '_', v1: 1, v2: 2}],
          ],
        });
        expect(sqlLogs).toEqual([
          ['BEGIN', undefined],
          [
            `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
            ['tinybase_values', 't1', 't2', 't3'],
          ],
          [
            'CREATE TABLE"t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2");',
            undefined,
          ],
          [
            'CREATE TABLE"t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1");',
            undefined,
          ],
          [
            'INSERT INTO"t1"("_id","c1","c2")VALUES(?,?,?),(?,?,?)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1","c2"=excluded."c2"',
            ['r1', 1, 2, 'r2', 1, 2],
          ],
          [
            'INSERT INTO"t2"("_id","c1")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
            ['r1', 1],
          ],
          ['DELETE FROM"t1"WHERE"_id"NOT IN(?,?)', ['r1', 'r2']],
          ['DELETE FROM"t2"WHERE"_id"NOT IN(?)', ['r1']],
          [
            'CREATE TABLE"tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2");',
            undefined,
          ],
          [
            'INSERT INTO"tinybase_values"("_id","v1","v2")VALUES(?,?,?)ON CONFLICT("_id")DO UPDATE SET"v1"=excluded."v1","v2"=excluded."v2"',
            ['_', 1, 2],
          ],
          ['DELETE FROM"tinybase_values"WHERE"_id"NOT IN(?)', ['_']],
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
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2", "v3")',
              [{_id: '_', v1: 1, v2: 2, v3: 3}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [`ALTER TABLE"tinybase_values"ADD"v3"`, undefined],
            [
              'INSERT INTO"tinybase_values"("_id","v3")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"v3"=excluded."v3"',
              ['_', 3],
            ],
            ['END', undefined],
          ]);
        });

        test('change', async () => {
          store.setValue('v1', 2);
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 2, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [
              'INSERT INTO"tinybase_values"("_id","v1")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"v1"=excluded."v1"',
              ['_', 2],
            ],
            ['END', undefined],
          ]);
        });

        test('delete', async () => {
          store.delValue('v1');
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: null, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [
              'INSERT INTO"tinybase_values"("_id","v1")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"v1"=excluded."v1"',
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
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: null, v2: null}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [
              'INSERT INTO"tinybase_values"("_id","v1","v2")VALUES(?,?,?)ON CONFLICT("_id")DO UPDATE SET"v1"=excluded."v1","v2"=excluded."v2"',
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
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2", "c3")',
              [
                {_id: 'r1', c1: 1, c2: 2, c3: 3},
                {_id: 'r2', c1: 1, c2: 2, c3: null},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [`ALTER TABLE"t1"ADD"c3"`, undefined],
            [
              'INSERT INTO"t1"("_id","c3")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"c3"=excluded."c3"',
              ['r1', 3],
            ],
            ['END', undefined],
          ]);
        });

        test('change', async () => {
          store.setCell('t1', 'r1', 'c1', 2);
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 2, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [
              'INSERT INTO"t1"("_id","c1")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
              ['r1', 2],
            ],
            ['END', undefined],
          ]);
        });

        test('delete', async () => {
          store.delCell('t1', 'r1', 'c1');
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: null, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [
              'INSERT INTO"t1"("_id","c1")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
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
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2", "c3")',
              [
                {_id: 'r1', c1: 1, c2: 2, c3: null},
                {_id: 'r2', c1: 1, c2: 2, c3: null},
                {_id: 'r3', c1: 1, c2: null, c3: 3},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [`ALTER TABLE"t1"ADD"c3"`, undefined],
            [
              'INSERT INTO"t1"("_id","c1","c3")VALUES(?,?,?)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1","c3"=excluded."c3"',
              ['r3', 1, 3],
            ],
            ['END', undefined],
          ]);
        });

        test('change', async () => {
          store.setRow('t1', 'r1', {c1: 2, c2: 2});
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 2, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [
              'INSERT INTO"t1"("_id","c1")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
              ['r1', 2],
            ],
            ['END', undefined],
          ]);
        });

        test('delete', async () => {
          store.delRow('t1', 'r1');
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [{_id: 'r2', c1: 1, c2: 2}],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            ['DELETE FROM"t1"WHERE"_id"=?', ['r1']],
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
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            t3: [
              'CREATE TABLE "t3"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [{_id: 'r1', c1: 1}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            [
              'CREATE TABLE"t3"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1");',
              undefined,
            ],
            [
              'INSERT INTO"t3"("_id","c1")VALUES(?,?)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1"',
              ['r1', 1],
            ],
            ['END', undefined],
          ]);
        });

        test('change', async () => {
          store.setTable('t2', {r1: {c1: 2, c2: 2}});
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1", "c2")',
              [{_id: 'r1', c1: 2, c2: 2}],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            ['ALTER TABLE"t2"ADD"c2"', undefined],
            [
              'INSERT INTO"t2"("_id","c1","c2")VALUES(?,?,?)ON CONFLICT("_id")DO UPDATE SET"c1"=excluded."c1","c2"=excluded."c2"',
              ['r1', 2, 2],
            ],
            ['END', undefined],
          ]);
        });

        test('delete', async () => {
          store.delTable('t2');
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [
                {_id: 'r1', c1: 1, c2: 2},
                {_id: 'r2', c1: 1, c2: 2},
              ],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            ['DELETE FROM"t2"WHERE 1', undefined],
            ['END', undefined],
          ]);
        });

        test('delete all', async () => {
          store.delTables();
          await pause();
          expect(await getDatabase(db)).toEqual({
            t1: [
              'CREATE TABLE "t1"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1","c2")',
              [],
            ],
            t2: [
              'CREATE TABLE "t2"("_id" PRIMARY KEY ON CONFLICT REPLACE,"c1")',
              [],
            ],
            tinybase_values: [
              'CREATE TABLE "tinybase_values"("_id" PRIMARY KEY ON CONFLICT REPLACE,"v1","v2")',
              [{_id: '_', v1: 1, v2: 2}],
            ],
          });
          expect(sqlLogs).toEqual([
            ['BEGIN', undefined],
            [
              `SELECT name FROM pragma_table_list WHERE schema='main'AND(type='table'OR type='view')AND name IN(?,?,?,?)ORDER BY name`,
              ['tinybase_values', 't1', 't2', 't3'],
            ],
            ['SELECT name,type FROM pragma_table_info(?)', ['t1']],
            ['SELECT name,type FROM pragma_table_info(?)', ['t2']],
            ['SELECT name,type FROM pragma_table_info(?)', ['tinybase_values']],
            ['DELETE FROM"t1"WHERE 1', undefined],
            ['DELETE FROM"t2"WHERE 1', undefined],
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

      beforeEach(() => {
        store1 = createStore();
        persister1 = getPersister(store1, db, {
          mode: 'tabular',
          tables: {load: {t1: 't1', t2: 't2'}, save: {t1: 't1', t2: 't2'}},
          values: {load: true, save: true},
          autoLoadIntervalSeconds,
        });
        store2 = createStore();
        persister2 = getPersister(store2, db, {
          mode: 'tabular',
          tables: {load: {t1: 't1', t2: 't2'}, save: {t1: 't1', t2: 't2'}},
          values: {load: true, save: true},
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
  },
);
