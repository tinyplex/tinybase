/* eslint-disable @typescript-eslint/no-unused-expressions */
// NB: an exclamation mark after a line visually indicates an expected TS error
import {createFilePersister} from 'tinybase/persisters/persister-file/with-schemas';
import {createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {c1: {type: 'number'}, c1d: {type: 'string', default: ''}},
} as const;

const valuesSchema = {
  v1: {type: 'number'},
  v1d: {type: 'string', default: ''},
} as const;

const storeWithSchemas = createStore().setSchema(tablesSchema, valuesSchema);
const persisterWithSchema = createFilePersister(storeWithSchemas, '');

const persisterWithNoSchema = createFilePersister(createStore(), '');
persisterWithNoSchema.getStore().getTables().t1;
persisterWithNoSchema.getStore().getTables().t2;

persisterWithSchema.load([{t1: {r1: {c1: 1}}}, {}]);
persisterWithSchema.load([{t1: {r1: {c1: 1}}}, {v1: 1}]);
persisterWithSchema.load([{t1: {r1: {c2: 1}}}, {}]); // !
persisterWithSchema.load([{t1: {r1: {c1: 'a'}}}, {}]); // !
persisterWithSchema.load([{t2: {r2: {c2: 1}}}, {}]); // !
persisterWithSchema.load([{t1: {r1: {c1: 1}}}, {v1: 'a'}]); // !
persisterWithSchema.load([{t1: {r1: {c1: 1}}}, {v2: 1}]); // !

persisterWithSchema.startAutoLoad([{t1: {r1: {c1: 1}}}, {}]);
persisterWithSchema.startAutoLoad([{t1: {r1: {c1: 1}}}, {v1: 1}]);
persisterWithSchema.startAutoLoad([{t1: {r1: {c2: 1}}}, {}]); // !
persisterWithSchema.startAutoLoad([{t1: {r1: {c1: 'a'}}}, {}]); // !
persisterWithSchema.startAutoLoad([{t2: {r2: {c2: 1}}}, {}]); // !
persisterWithSchema.startAutoLoad([{t1: {r1: {c1: 1}}}, {v1: 'a'}]); // !
persisterWithSchema.startAutoLoad([{t1: {r1: {c1: 1}}}, {v2: 1}]); // !

persisterWithSchema.getStore().getTables().t1;
persisterWithSchema.getStore().getTables().t2; // !

(await persisterWithSchema.stopAutoSave()).getStore().getTables().t1;
(await persisterWithSchema.stopAutoSave()).getStore().getTables().t2; // !

(await persisterWithSchema.destroy()).getStore().getTables().t1;
(await persisterWithSchema.destroy()).getStore().getTables().t2; // !

const _testPromises = async () => {
  (await persisterWithSchema.save()).getStore().getTables().t1;
  (await persisterWithSchema.save()).getStore().getTables().t2; // !

  (await persisterWithSchema.startAutoSave()).getStore().getTables().t1;
  (await persisterWithSchema.startAutoSave()).getStore().getTables().t2; // !
};

// WhenSet flags
type TestSchemas = [typeof tablesSchema, typeof valuesSchema];
type StoreOnly = import('tinybase/persisters/with-schemas').Persists.StoreOnly;
type CustomPersister =
  typeof import('tinybase/persisters/with-schemas').createCustomPersister;
type PersistedContentWhenSet =
  import('tinybase/persisters/with-schemas').PersistedContent<
    TestSchemas,
    StoreOnly,
    true
  >;
type PersisterListenerWhenSet =
  import('tinybase/persisters/with-schemas').PersisterListener<
    TestSchemas,
    StoreOnly,
    true
  >;
const createCustomPersisterWithSchemas = null as unknown as CustomPersister;
const persistedContentWhenSet: PersistedContentWhenSet = [
  {t1: {r1: {c1: 1}}},
  {v1: 1},
];
const _persistedContentWhenSetWithBadCell: PersistedContentWhenSet = [
  {t1: {r1: {c1: 'a'}}}, // !
  {v1: 1},
];
const _persistedContentWhenSetWithBadCellId: PersistedContentWhenSet = [
  {t1: {r1: {c2: 1}}}, // !
  {v1: 1},
];
const _persistedContentWhenSetWithBadValue: PersistedContentWhenSet = [
  {t1: {r1: {c1: 1}}},
  {v1: 'a'}, // !
];
const _persistedContentWhenSetWithBadValueId: PersistedContentWhenSet = [
  {t1: {r1: {c1: 1}}},
  {v2: 1}, // !
];
let persisterListenerWhenSet: PersisterListenerWhenSet | undefined;
const customPersisterWithSchema = createCustomPersisterWithSchemas(
  storeWithSchemas,
  async () => persistedContentWhenSet,
  async () => {},
  (listener) => (persisterListenerWhenSet = listener),
  () => {},
);

persisterListenerWhenSet?.(persistedContentWhenSet);
persisterListenerWhenSet?.([
  {t1: {r1: {c1: 'a'}}}, // !
  {v1: 1},
]);
customPersisterWithSchema.getStore().getTables().t1;
