import type {Store, Store as StoreDebug} from 'tinybase';
import type {
  Store as StoreDebugWithSchemas,
  Store as StoreWithSchemas,
} from 'tinybase/with-schemas';
import {createStore, createStore as createStoreDebug} from 'tinybase';
import {
  createStore as createStoreDebugWithSchemas,
  createStore as createStoreWithSchemas,
} from 'tinybase/with-schemas';

const _store: Store = createStore();
const _storeDebug: StoreDebug = createStoreDebug();
const _storeWithSchemas: StoreWithSchemas<any> = createStoreWithSchemas();
const _storeDebugWithSchemas: StoreDebugWithSchemas<any> =
  createStoreDebugWithSchemas();
