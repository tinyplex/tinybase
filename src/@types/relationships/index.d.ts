/// relationships

import type {GetCell, RowCallback, Store} from '../store/index.d.ts';
import type {Id, IdOrNull, Ids} from '../common/index.d.ts';

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

/// RelationshipIdsListener
export type RelationshipIdsListener = (relationships: Relationships) => void;

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
  //
  /// Relationships.setRelationshipDefinition
  setRelationshipDefinition(
    relationshipId: Id,
    localTableId: Id,
    remoteTableId: Id,
    getRemoteRowId: Id | ((getCell: GetCell, localRowId: Id) => Id),
  ): Relationships;

  /// Relationships.delRelationshipDefinition
  delRelationshipDefinition(relationshipId: Id): Relationships;

  /// Relationships.getStore
  getStore(): Store;

  /// Relationships.getRelationshipIds
  getRelationshipIds(): Ids;

  /// Relationships.forEachRelationship
  forEachRelationship(relationshipCallback: RelationshipCallback): void;

  /// Relationships.hasRelationship
  hasRelationship(relationshipId: Id): boolean;

  /// Relationships.getLocalTableId
  getLocalTableId(relationshipId: Id): Id | undefined;

  /// Relationships.getRemoteTableId
  getRemoteTableId(relationshipId: Id): Id | undefined;

  /// Relationships.getRemoteRowId
  getRemoteRowId(relationshipId: Id, localRowId: Id): Id | undefined;

  /// Relationships.getLocalRowIds
  getLocalRowIds(relationshipId: Id, remoteRowId: Id): Ids;

  /// Relationships.getLinkedRowIds
  getLinkedRowIds(relationshipId: Id, firstRowId: Id): Ids;

  /// Relationships.addRelationshipIdsListener
  addRelationshipIdsListener(listener: RelationshipIdsListener): Id;

  /// Relationships.addRemoteRowIdListener
  addRemoteRowIdListener(
    relationshipId: IdOrNull,
    localRowId: IdOrNull,
    listener: RemoteRowIdListener,
  ): Id;

  /// Relationships.addLocalRowIdsListener
  addLocalRowIdsListener(
    relationshipId: IdOrNull,
    remoteRowId: IdOrNull,
    listener: LocalRowIdsListener,
  ): Id;

  /// Relationships.addLinkedRowIdsListener
  addLinkedRowIdsListener(
    relationshipId: Id,
    firstRowId: Id,
    listener: LinkedRowIdsListener,
  ): Id;

  /// Relationships.delListener
  delListener(listenerId: Id): Relationships;

  /// Relationships.destroy
  destroy(): void;

  /// Relationships.getListenerStats
  getListenerStats(): RelationshipsListenerStats;
  //
}

/// createRelationships
export function createRelationships(store: Store): Relationships;
