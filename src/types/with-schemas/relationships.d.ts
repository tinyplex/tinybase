/// relationships

import {CellIdFromSchema, TableIdFromSchema} from './internal/store.d';
import {
  GetCell,
  OptionalSchemas,
  OptionalTablesSchema,
  RowCallback,
  Store,
} from './store.d';
import {Id, IdOrNull, Ids} from './common.d';

/// Relationship
export type Relationship = {
  remoteRowId: {[localRowId: Id]: Id};
  localRowIds: {[remoteRowId: Id]: Ids};
  linkedRowIds: {[firstRowId: Id]: Ids};
};

/// RelationshipCallback
export type RelationshipCallback<Schema extends OptionalTablesSchema> = (
  relationshipId: Id,
  forEachRow: (rowCallback: RowCallback<Schema>) => void,
) => void;

/// RelationshipIdsListener
export type RelationshipIdsListener<Schemas extends OptionalSchemas> = (
  relationships: Relationships<Schemas>,
) => void;

/// RemoteRowIdListener
export type RemoteRowIdListener<Schemas extends OptionalSchemas> = (
  relationships: Relationships<Schemas>,
  relationshipId: Id,
  localRowId: Id,
) => void;

/// LocalRowIdsListener
export type LocalRowIdsListener<Schemas extends OptionalSchemas> = (
  relationships: Relationships<Schemas>,
  relationshipId: Id,
  remoteRowId: Id,
) => void;

/// LinkedRowIdsListener
export type LinkedRowIdsListener<Schemas extends OptionalSchemas> = (
  relationships: Relationships<Schemas>,
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
export interface Relationships<in out Schemas extends OptionalSchemas> {
  /// Relationships.setRelationshipDefinition
  setRelationshipDefinition<LocalTableId extends TableIdFromSchema<Schemas[0]>>(
    relationshipId: Id,
    localTableId: LocalTableId,
    remoteTableId: TableIdFromSchema<Schemas[0]>,
    getRemoteRowId:
      | CellIdFromSchema<Schemas[0], LocalTableId>
      | ((getCell: GetCell<Schemas[0], LocalTableId>, localRowId: Id) => Id),
  ): Relationships<Schemas>;

  /// Relationships.delRelationshipDefinition
  delRelationshipDefinition(relationshipId: Id): Relationships<Schemas>;

  /// Relationships.getStore
  getStore(): Store<Schemas>;

  /// Relationships.getRelationshipIds
  getRelationshipIds(): Ids;

  /// Relationships.forEachRelationship
  forEachRelationship(
    relationshipCallback: RelationshipCallback<Schemas[0]>,
  ): void;

  /// Relationships.hasRelationship
  hasRelationship(relationshipId: Id): boolean;

  /// Relationships.getLocalTableId
  getLocalTableId<TableId extends TableIdFromSchema<Schemas[0]>>(
    relationshipId: Id,
  ): TableId | undefined;

  /// Relationships.getRemoteTableId
  getRemoteTableId<TableId extends TableIdFromSchema<Schemas[0]>>(
    relationshipId: Id,
  ): TableId | undefined;

  /// Relationships.getRemoteRowId
  getRemoteRowId(relationshipId: Id, localRowId: Id): Id | undefined;

  /// Relationships.getLocalRowIds
  getLocalRowIds(relationshipId: Id, remoteRowId: Id): Ids;

  /// Relationships.getLinkedRowIds
  getLinkedRowIds(relationshipId: Id, firstRowId: Id): Ids;

  /// Relationships.addRelationshipIdsListener
  addRelationshipIdsListener(listener: RelationshipIdsListener<Schemas>): Id;

  /// Relationships.addRemoteRowIdListener
  addRemoteRowIdListener(
    relationshipId: IdOrNull,
    localRowId: IdOrNull,
    listener: RemoteRowIdListener<Schemas>,
  ): Id;

  /// Relationships.addLocalRowIdsListener
  addLocalRowIdsListener(
    relationshipId: IdOrNull,
    remoteRowId: IdOrNull,
    listener: LocalRowIdsListener<Schemas>,
  ): Id;

  /// Relationships.addLinkedRowIdsListener
  addLinkedRowIdsListener(
    relationshipId: Id,
    firstRowId: Id,
    listener: LinkedRowIdsListener<Schemas>,
  ): Id;

  /// Relationships.delListener
  delListener(listenerId: Id): Relationships<Schemas>;

  /// Relationships.destroy
  destroy(): void;

  /// Relationships.getListenerStats
  getListenerStats(): RelationshipsListenerStats;
}

/// createRelationships
export function createRelationships<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Relationships<Schemas>;
