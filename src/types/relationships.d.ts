/// relationships

import {GetCell, RowCallback, Store} from './store.d';
import {Id, IdOrNull, Ids} from './common.d';

/// Relationship
export type Relationship = {
  remoteRowId: {[localRowId: Id]: Id};
  localRowIds: {[remoteRowId: Id]: Ids};
  linkedRowIds: {[firstRowId: Id]: Ids};
};

/// RelationshipCallback
export type RelationshipCallback = (
  relationshipId: Id,
  forEachRow: (rowCallback: RowCallback) => void,
) => void;

/// RemoteRowIdListener
export type RemoteRowIdListener = (
  relationships: Relationships,
  relationshipId: Id,
  localRowId: Id,
) => void;

/// LocalRowIdsListener
export type LocalRowIdsListener = (
  relationships: Relationships,
  relationshipId: Id,
  remoteRowId: Id,
) => void;

/// LinkedRowIdsListener
export type LinkedRowIdsListener = (
  relationships: Relationships,
  relationshipId: Id,
  firstRowId: Id,
) => void;

/// RelationshipsListenerStats
export type RelationshipsListenerStats = {
  /// RelationshipsListenerStats.remoteRowId
  remoteRowId?: number;
  /// RelationshipsListenerStats.localRowIds
  localRowIds?: number;
  /// RelationshipsListenerStats.linkedRowIds
  linkedRowIds?: number;
};

/// Relationships
export interface Relationships {
  /// setRelationshipDefinition
  setRelationshipDefinition(
    relationshipId: Id,
    localTableId: Id,
    remoteTableId: Id,
    getRemoteRowId: Id | ((getCell: GetCell, localRowId: Id) => Id),
  ): Relationships;

  /// delRelationshipDefinition
  delRelationshipDefinition(relationshipId: Id): Relationships;

  /// getStore
  getStore(): Store;

  /// getRelationshipIds
  getRelationshipIds(): Ids;

  /// forEachRelationship
  forEachRelationship(relationshipCallback: RelationshipCallback): void;

  /// hasRelationship
  hasRelationship(indexId: Id): boolean;

  /// getLocalTableId
  getLocalTableId(relationshipId: Id): Id | undefined;

  /// getRemoteTableId
  getRemoteTableId(relationshipId: Id): Id | undefined;

  /// getRemoteRowId
  getRemoteRowId(relationshipId: Id, localRowId: Id): Id | undefined;

  /// getLocalRowIds
  getLocalRowIds(relationshipId: Id, remoteRowId: Id): Ids;

  /// getLinkedRowIds
  getLinkedRowIds(relationshipId: Id, firstRowId: Id): Ids;

  /// addRemoteRowIdListener
  addRemoteRowIdListener(
    relationshipId: IdOrNull,
    localRowId: IdOrNull,
    listener: RemoteRowIdListener,
  ): Id;

  /// addLocalRowIdsListener
  addLocalRowIdsListener(
    relationshipId: IdOrNull,
    remoteRowId: IdOrNull,
    listener: LocalRowIdsListener,
  ): Id;

  /// addLinkedRowIdsListener
  addLinkedRowIdsListener(
    relationshipId: Id,
    firstRowId: Id,
    listener: LinkedRowIdsListener,
  ): Id;

  /// delListener
  delListener(listenerId: Id): Relationships;

  /// destroy
  destroy(): void;

  /// getListenerStats
  getListenerStats(): RelationshipsListenerStats;
}

/// createRelationships
export function createRelationships(store: Store): Relationships;
