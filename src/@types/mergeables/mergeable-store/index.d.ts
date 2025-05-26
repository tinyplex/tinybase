/// mergeable-store
import type {Id} from '../../common/index.d.ts';
import type {Content, Store} from '../../store/index.d.ts';
import type {
  GetNow,
  Mergeable,
  MergeableChanges,
  MergeableContent,
} from '../index.d.ts';

/// MergeableStore
export interface MergeableStore extends Mergeable, Store {
  //
  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent;

  /// MergeableStore.setMergeableContent
  setMergeableContent(mergeableContent: MergeableContent): MergeableStore;

  /// MergeableStore.setDefaultContent
  setDefaultContent(content: Content | (() => Content)): this;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(withHashes?: boolean): MergeableChanges<true>;

  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore): MergeableStore;

  /// Store.isMergeable
  isMergeable(): boolean;
}

/// createMergeableStore
export function createMergeableStore(
  uniqueId?: Id,
  getNow?: GetNow,
): MergeableStore;
