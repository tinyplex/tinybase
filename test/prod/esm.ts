import {Store, createStore} from 'tinybase';
import {
  Store as StoreDebug,
  createStore as createStoreDebug,
} from 'tinybase/debug';
import {
  Store as StoreDebugWithSchemas,
  createStore as createStoreDebugWithSchemas,
} from 'tinybase/debug/with-schemas';
import {
  Store as StoreWithSchemas,
  createStore as createStoreWithSchemas,
} from 'tinybase/with-schemas';

const _store: Store = createStore();
const _storeDebug: StoreDebug = createStoreDebug();
const _storeWithSchemas: StoreWithSchemas<any> = createStoreWithSchemas();
const _storeDebugWithSchemas: StoreDebugWithSchemas<any> =
  createStoreDebugWithSchemas();
