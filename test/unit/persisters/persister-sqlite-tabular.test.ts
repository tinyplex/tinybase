/* eslint-disable @typescript-eslint/ban-ts-comment */
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
          expect(await getDatabase(db)).toEqual({});
        });

        describe('tables', () => {
          test('one to one', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {save: {t1: 't1', t2: 't2'}},
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
          await getPersister(store, db, {mode: 'tabular'}).load();
          expect(store.getContent()).toEqual([{}, {}]);
        });

        describe('tables', () => {
          test('one to one', async () => {
            await getPersister(store, db, {
              mode: 'tabular',
              tables: {load: {t1: 't1', t2: 't2'}},
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
        });
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
        await persister.load({t1: {r1: {c1: 1}}}, {v1: 1});
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
        });
        store2 = createStore();
        persister2 = getPersister(store2, db, {
          mode: 'tabular',
          tables: {load: {t1: 't1', t2: 't2'}, save: {t1: 't1', t2: 't2'}},
          values: {load: true, save: true},
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
        store1.delTable('t2');
        await pause();
        expect(store2.getContent()).toEqual([
          {t1: {r1: {c1: 2}}},
          {v1: 1, v2: 2},
        ]);
        store1.delValue('v2');
        await pause();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
        store1.setValue('v1', 2);
        await pause();
        expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
      });
    });
  },
);
