import type {Store} from 'tinybase';
import type {Store as StoreDebug} from 'tinybase/debug';
import type {Store as StoreDebugWithSchemas} from 'tinybase/debug/with-schemas';
import type {Store as StoreWithSchemas} from 'tinybase/with-schemas';
import {createStore} from 'tinybase';
import {createStore as createStoreDebug} from 'tinybase/debug';
import {createStore as createStoreDebugWithSchemas} from 'tinybase/debug/with-schemas';
import {createStore as createStoreWithSchemas} from 'tinybase/with-schemas';

const _store: Store = createStore();
const _storeDebug: StoreDebug = createStoreDebug();
const _storeWithSchemas: StoreWithSchemas<any> = createStoreWithSchemas();
const _storeDebugWithSchemas: StoreDebugWithSchemas<any> =
  createStoreDebugWithSchemas();
