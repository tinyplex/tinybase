import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import {createMergeableStore, createStore} from 'tinybase';
import {createSupabasePersister} from 'tinybase/persisters/persister-supabase';
import {expect, test, vi} from 'vitest';
import {pause} from '../common/other.ts';

const URL_BASE = 'https://project.supabase.co';
const KEY = 'anon-key';
const REST_PATH = '/rest/v1/';

type Rows = {[rowId: string]: {[column: string]: string}};
type Tables = {[tableName: string]: Rows};

const json = (body: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json'},
  });

// Just enough PostgREST to serve the two requests the Persister makes.
const getMockFetch = (tables: Tables) =>
  vi.fn(async (input: any, init: any = {}) => {
    const url = new URL(typeof input == 'string' ? input : input.url);
    const tableName = url.pathname.slice(REST_PATH.length);
    const rows = tables[tableName];
    if (rows == null) {
      return json(
        {code: '42P01', message: `relation "${tableName}" does not exist`},
        404,
      );
    }
    if ((init.method ?? 'GET') == 'GET') {
      const columns = (url.searchParams.get('select') ?? '*').split(',');
      return json(
        Object.entries(rows)
          .filter(([, row]) =>
            [...url.searchParams].every(
              ([key, value]) => key == 'select' || value == 'eq.' + row[key],
            ),
          )
          .map(([, row]) =>
            columns[0] == '*'
              ? row
              : Object.fromEntries(columns.map((c) => [c, row[c]])),
          ),
      );
    }
    const body = JSON.parse(init.body);
    (Array.isArray(body) ? body : [body]).forEach((row: any) => {
      const rowId = row[Object.keys(row)[0]];
      rows[rowId] = {...rows[rowId], ...row};
    });
    return new Response('', {status: 201});
  });

let clients = 0;
const getSupabase = (tables: Tables): SupabaseClient =>
  createClient(URL_BASE, KEY, {
    auth: {persistSession: false, storageKey: 'test' + clients++},
    global: {fetch: getMockFetch(tables) as any},
  });

const mockChannel = (supabase: SupabaseClient) => {
  const listeners: (() => void)[] = [];
  const channel = {
    on: vi.fn((_event: string, _filter: any, listener: () => void) => {
      listeners.push(listener);
      return channel;
    }),
    subscribe: vi.fn(() => channel),
  };
  const channelSpy = vi
    .spyOn(supabase, 'channel')
    .mockReturnValue(channel as any);
  const removeSpy = vi
    .spyOn(supabase, 'removeChannel')
    .mockResolvedValue('ok' as any);
  return {channel, channelSpy, listeners, removeSpy};
};

test('saves and loads a Store', async () => {
  const tables: Tables = {tinybase: {}};
  const supabase = getSupabase(tables);
  const persister = createSupabasePersister(
    createStore().setTables({pets: {fido: {species: 'dog'}}}),
    supabase,
  );

  await persister.save();
  expect(tables.tinybase).toEqual({
    _: {_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'},
  });

  const store2 = createStore();
  await createSupabasePersister(store2, supabase).load();
  expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});

  await persister.destroy();
});

test('uses the same JSON serialization as the SQL Persisters', async () => {
  const tables: Tables = {
    tinybase: {
      _: {_id: '_', store: '[{"pets":{"felix":{"species":"cat"}}},{}]'},
    },
  };
  const store = createStore();
  await createSupabasePersister(store, getSupabase(tables)).load();

  expect(store.getTables()).toEqual({pets: {felix: {species: 'cat'}}});
});

test('loads nothing when the row is absent', async () => {
  const store = createStore().setValue('species', 'dog');
  await createSupabasePersister(store, getSupabase({tinybase: {}})).load();

  expect(store.getValues()).toEqual({species: 'dog'});
});

test('ignores errors when the table is missing', async () => {
  const onIgnoredError = vi.fn();
  const store = createStore().setValue('species', 'dog');
  const persister = createSupabasePersister(
    store,
    getSupabase({}),
    undefined,
    onIgnoredError,
  );

  await persister.load();
  await persister.save();

  expect(onIgnoredError).toHaveBeenCalledTimes(2);
  expect(onIgnoredError.mock.calls[0][0].code).toBe('42P01');
});

test('honors configured table and column names', async () => {
  const tables: Tables = {my_store: {}};
  const supabase = getSupabase(tables);
  const persister = createSupabasePersister(
    createStore().setValue('species', 'dog'),
    supabase,
    {mode: 'json', storeTableName: 'my_store', storeColumnName: 'content'},
  );

  await persister.save();
  expect(tables.my_store).toEqual({
    _: {_id: '_', content: '[{},{"species":"dog"}]'},
  });

  await persister.destroy();
});

test('takes a table name as a string', async () => {
  const tables: Tables = {my_store: {}};
  const persister = createSupabasePersister(
    createStore().setValue('species', 'dog'),
    getSupabase(tables),
    'my_store',
  );

  await persister.save();
  expect(Object.keys(tables.my_store)).toEqual(['_']);

  await persister.destroy();
});

test('saves and loads a MergeableStore', async () => {
  const tables: Tables = {tinybase: {}};
  const supabase = getSupabase(tables);
  const persister = createSupabasePersister(
    createMergeableStore().setTables({pets: {fido: {species: 'dog'}}}),
    supabase,
  );
  await persister.save();

  const store2 = createMergeableStore();
  await createSupabasePersister(store2, supabase).load();

  expect(store2.getTables()).toEqual({pets: {fido: {species: 'dog'}}});
  await persister.destroy();
});

test('returns the Supabase client', async () => {
  const supabase = getSupabase({tinybase: {}});
  const persister = createSupabasePersister(createStore(), supabase);

  expect(persister.getSupabase()).toBe(supabase);
  await persister.destroy();
});

test('auto-loads over Realtime', async () => {
  const tables: Tables = {tinybase: {}};
  const supabase = getSupabase(tables);
  const {channel, channelSpy, listeners, removeSpy} = mockChannel(supabase);
  const store = createStore();
  const persister = createSupabasePersister(store, supabase);

  await persister.startAutoLoad();
  expect(channelSpy).toHaveBeenCalledOnce();
  expect(channel.on).toHaveBeenCalledWith(
    'postgres_changes',
    {event: '*', schema: 'public', table: 'tinybase'},
    expect.any(Function),
  );
  expect(channel.subscribe).toHaveBeenCalledOnce();

  tables.tinybase._ = {
    _id: '_',
    store: '[{"pets":{"fido":{"species":"dog"}}},{}]',
  };
  listeners.forEach((listener) => listener());
  await pause(10);
  expect(store.getTables()).toEqual({pets: {fido: {species: 'dog'}}});

  await persister.destroy();
  expect(removeSpy).toHaveBeenCalledWith(channel);
});

test('does not poll unless an interval is configured', async () => {
  const tables: Tables = {tinybase: {}};
  const supabase = getSupabase(tables);
  mockChannel(supabase);
  const store = createStore();
  const persister = createSupabasePersister(store, supabase);
  await persister.startAutoLoad();

  tables.tinybase._ = {
    _id: '_',
    store: '[{"pets":{"fido":{"species":"dog"}}},{}]',
  };
  await pause(100);
  expect(store.getTables()).toEqual({});

  await persister.destroy();
});

test('polls when an interval is configured', async () => {
  const tables: Tables = {tinybase: {}};
  const supabase = getSupabase(tables);
  mockChannel(supabase);
  const store = createStore();
  const persister = createSupabasePersister(store, supabase, {
    mode: 'json',
    autoLoadIntervalSeconds: 0.01,
  });
  await persister.startAutoLoad();

  tables.tinybase._ = {
    _id: '_',
    store: '[{"pets":{"fido":{"species":"dog"}}},{}]',
  };
  for (let i = 0; i < 100 && !store.hasTable('pets'); i++) {
    await pause(10);
  }
  expect(store.getTables()).toEqual({pets: {fido: {species: 'dog'}}});

  await persister.destroy();
});
