/// mergeable-store

import {Store} from './store.d';

/// MergeableStore
export interface MergeableStore extends Store {}

/// createMergeableStore
export function createMergeableStore(): MergeableStore;
