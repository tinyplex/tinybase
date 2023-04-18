/// relationships

import {CellIdFromSchema, TableIdFromSchema} from './internal/store';
import {
  GetCell,
  NoSchemas,
  NoTablesSchema,
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
export type RelationshipCallback<
  in out Schema extends OptionalTablesSchema = NoTablesSchema,
> = (
  relationshipId: Id,
  forEachRow: (rowCallback: RowCallback<Schema>) => void,
) => void;

/// RemoteRowIdListener
export type RemoteRowIdListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
> = (
  relationships: Relationships<Schemas>,
  relationshipId: Id,
  localRowId: Id,
) => void;

/// LocalRowIdsListener
export type LocalRowIdsListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
> = (
  relationships: Relationships<Schemas>,
  relationshipId: Id,
  remoteRowId: Id,
) => void;

/// LinkedRowIdsListener
export type LinkedRowIdsListener<
  in out Schemas extends OptionalSchemas = NoSchemas,
> = (
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
export interface Relationships<
  in out Schemas extends OptionalSchemas = NoSchemas,
> {
  /// setRelationshipDefinition
  setRelationshipDefinition<
    LocalTableId extends TableIdFromSchema<Schemas[0]>,
    RemoteTableId extends TableIdFromSchema<Schemas[0]>,
    LocalCellId extends CellIdFromSchema<Schemas[0], LocalTableId>,
  >(
    relationshipId: Id,
    localTableId: LocalTableId,
    remoteTableId: RemoteTableId,
    getRemoteRowId:
      | LocalCellId
      | ((getCell: GetCell<Schemas[0], LocalTableId>, localRowId: Id) => Id),
  ): Relationships<Schemas>;

  /// delRelationshipDefinition
  delRelationshipDefinition(relationshipId: Id): Relationships<Schemas>;

  /// getStore
  getStore(): Store<Schemas>;

  /// getRelationshipIds
  getRelationshipIds(): Ids;

  /// forEachRelationship
  forEachRelationship(relationshipCallback: RelationshipCallback): void;

  /// hasRelationship
  hasRelationship(indexId: Id): boolean;

  /// getLocalTableId
  getLocalTableId<TableId extends TableIdFromSchema<Schemas[0]>>(
    relationshipId: Id,
  ): TableId | undefined;

  /// getRemoteTableId
  getRemoteTableId<TableId extends TableIdFromSchema<Schemas[0]>>(
    relationshipId: Id,
  ): TableId | undefined;

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
  delListener(listenerId: Id): Relationships<Schemas>;

  /// destroy
  destroy(): void;

  /// getListenerStats
  getListenerStats(): RelationshipsListenerStats;
}

/// createRelationships
export function createRelationships<Schemas extends OptionalSchemas>(
  store: Store<Schemas>,
): Relationships<Schemas>;
