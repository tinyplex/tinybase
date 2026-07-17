import {PowerSyncDatabase, Schema, Table, column} from '@powersync/node';
import {rm} from 'node:fs/promises';
import {createStore} from 'tinybase';
import * as PowerSync from 'tinybase/persisters/persister-powersync';
import tmp from 'tmp';
import {afterEach, expect, test, vi} from 'vitest';

tmp.setGracefulCleanup();

type CrudSummary = {
  op: string;
  table: string;
  id: string;
  opData?: {[cellId: string]: any};
};

const powerSyncs: PowerSyncDatabase[] = [];
const dbFilenames: string[] = [];

const createPowerSync = async (): Promise<PowerSyncDatabase> => {
  const dbFilename = tmp.tmpNameSync();
  const powerSync = new PowerSyncDatabase({
    schema: new Schema({
      pets: new Table({species: column.text}, {ignoreEmptyUpdates: true}),
    }),
    database: {
      dbFilename,
      implementation: {type: 'better-sqlite3'},
      readWorkerCount: 1,
    },
  });
  powerSyncs.push(powerSync);
  dbFilenames.push(dbFilename);
  await powerSync.init();
  return powerSync;
};

const summarizeBatch = async (
  powerSync: PowerSyncDatabase,
): Promise<[CrudSummary[], (() => Promise<void>)?]> => {
  const batch = await powerSync.getCrudBatch();
  return [
    batch?.crud.map(({op, table, id, opData}) => ({
      op,
      table,
      id,
      opData,
    })) ?? [],
    batch?.complete,
  ];
};

const completeNextBatch = async (powerSync: PowerSyncDatabase) =>
  (await summarizeBatch(powerSync))[1]?.();

const getPowerSyncForPersister = (powerSync: PowerSyncDatabase): any => ({
  // The Node SDK's better-sqlite3 adapter expects '?' bindings, while the Web
  // SDK accepts TinyBase's '$1' bindings. This keeps the test focused on the
  // real PowerSync CRUD queue behavior rather than adapter placeholder syntax.
  execute: (sql: string, params?: any[]) =>
    powerSync.execute(sql.replace(/\$\d+/g, '?'), params),
  onChange: powerSync.onChange.bind(powerSync),
});

afterEach(async () => {
  await Promise.all(powerSyncs.splice(0).map((powerSync) => powerSync.close()));
  await Promise.all(
    dbFilenames
      .splice(0)
      .flatMap((dbFilename) => [
        rm(dbFilename, {force: true}),
        rm(`${dbFilename}-shm`, {force: true}),
        rm(`${dbFilename}-wal`, {force: true}),
      ]),
  );
});

test('PowerSync records replacement writes as puts', async () => {
  const powerSync = await createPowerSync();

  await powerSync.execute('INSERT INTO pets(id, species) VALUES (?, ?)', [
    'fido',
    'dog',
  ]);
  await completeNextBatch(powerSync);

  await powerSync.execute(
    'INSERT OR REPLACE INTO pets(id, species) VALUES (?, ?)',
    ['fido', 'dog'],
  );

  expect((await summarizeBatch(powerSync))[0]).toEqual([
    {op: 'PUT', table: 'pets', id: 'fido', opData: {species: 'dog'}},
  ]);
});

test('PowerSync persister records existing rows as patches', async () => {
  const powerSync = await createPowerSync();

  await powerSync.execute('INSERT INTO pets(id, species) VALUES (?, ?)', [
    'fido',
    'dog',
  ]);
  await completeNextBatch(powerSync);

  const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
  const persister = PowerSync.createPowerSyncPersister(
    store,
    getPowerSyncForPersister(powerSync),
    {
      mode: 'tabular',
      tables: {
        save: {pets: {tableName: 'pets', rowIdColumnName: 'id'}},
      },
    },
  );

  try {
    await persister.save();
    expect((await summarizeBatch(powerSync))[0]).toEqual([]);

    store.setCell('pets', 'fido', 'species', 'wolf');
    await persister.save();
    expect((await summarizeBatch(powerSync))[0]).toEqual([
      {op: 'PATCH', table: 'pets', id: 'fido', opData: {species: 'wolf'}},
    ]);
    await completeNextBatch(powerSync);

    store.setCell('pets', 'felix', 'species', 'cat');
    await persister.save();
    expect((await summarizeBatch(powerSync))[0]).toEqual([
      {op: 'PUT', table: 'pets', id: 'felix', opData: {species: 'cat'}},
    ]);
  } finally {
    await persister.destroy();
  }
});

test('PowerSync persister reports change iterator errors', async () => {
  const error = new Error('change iterator failed');
  const ignoredError = vi.fn();
  const persister = PowerSync.createPowerSyncPersister(
    createStore(),
    {
      execute: async () => ({rows: {_array: []}}),
      onChange: () => ({
        async *[Symbol.asyncIterator]() {
          throw error;
        },
      }),
    } as any,
    undefined,
    undefined,
    ignoredError,
  );

  await persister.startAutoLoad();
  await vi.waitFor(() => expect(ignoredError).toHaveBeenCalledWith(error));
  await persister.destroy();
});
