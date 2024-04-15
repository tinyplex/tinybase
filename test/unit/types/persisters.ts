// NB: an exclamation mark after a line visually indicates an expected TS error

import {createFilePersister} from 'tinybase/debug/persisters/persister-file/with-schemas';
import {createStore} from 'tinybase/debug/with-schemas';

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

persisterWithSchema.stopAutoSave().getStore().getTables().t1;
persisterWithSchema.stopAutoSave().getStore().getTables().t2; // !

persisterWithSchema.destroy().getStore().getTables().t1;
persisterWithSchema.destroy().getStore().getTables().t2; // !

const _testPromises = async () => {
  (await persisterWithSchema.save()).getStore().getTables().t1;
  (await persisterWithSchema.save()).getStore().getTables().t2; // !

  (await persisterWithSchema.startAutoSave()).getStore().getTables().t1;
  (await persisterWithSchema.startAutoSave()).getStore().getTables().t2; // !
};
