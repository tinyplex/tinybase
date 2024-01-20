import {IdObj, objFreeze, objMap} from './common/obj';
import {
  MergeableStore,
  createMergeableStore as createMergeableStoreDecl,
} from './types/mergeable-store';
import {createStore} from './store';

export const createMergeableStore = ((): MergeableStore => {
  const store = createStore();
  const mergeableStore: IdObj<any> = {};
  objMap(store as IdObj<any>, (method, name) => {
    mergeableStore[name] = method;
  });
  return objFreeze(mergeableStore) as MergeableStore;
}) as typeof createMergeableStoreDecl;
