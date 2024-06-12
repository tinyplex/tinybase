import type {Id, IdOrNull} from 'tinybase';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toEqualWithOrder(expected: any): R;
    }
  }
}

export type IdObj<Value> = {[id: string]: Value};
export type IdObj2<Value> = IdObj<IdObj<Value>>;
export type Logs = IdObj<any[]>;
export type Listener = Readonly<{logs: Logs}>;

export type StoreListener = Listener &
  Readonly<{
    listenToHasTables: (id: Id) => Id;
    listenToTables: (id: Id) => Id;
    listenToTableIds: (id: Id) => Id;
    listenToHasTable: (id: Id, tableId: IdOrNull) => Id;
    listenToTable: (id: Id, tableId: IdOrNull) => Id;
    listenToTableCellIds: (id: Id, tableId: IdOrNull) => Id;
    listenToHasTableCell: (id: Id, tableId: IdOrNull, cellId: IdOrNull) => Id;
    listenToRowCount: (id: Id, tableId: IdOrNull) => Id;
    listenToRowIds: (id: Id, tableId: IdOrNull) => Id;
    listenToSortedRowIds: (
      id: Id,
      tableId: Id,
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
      limit: number | undefined,
    ) => Id;
    listenToHasRow: (id: Id, tableId: IdOrNull, rowId: IdOrNull) => Id;
    listenToRow: (id: Id, tableId: IdOrNull, rowId: IdOrNull) => Id;
    listenToCellIds: (id: Id, tableId: IdOrNull, rowId: IdOrNull) => Id;
    listenToHasCell: (
      id: Id,
      tableId: IdOrNull,
      rowId: IdOrNull,
      cellId: IdOrNull,
    ) => Id;
    listenToCell: (
      id: Id,
      tableId: IdOrNull,
      rowId: IdOrNull,
      cellId: IdOrNull,
    ) => Id;
    listenToInvalidCell: (
      id: Id,
      tableId: IdOrNull,
      rowId: IdOrNull,
      cellId: IdOrNull,
    ) => Id;
    listenToHasValues: (id: Id) => Id;
    listenToValues: (id: Id) => Id;
    listenToValueIds: (id: Id) => Id;
    listenToHasValue: (id: Id, valueId: IdOrNull) => Id;
    listenToValue: (id: Id, valueId: IdOrNull) => Id;
    listenToInvalidValue: (id: Id, valueId: IdOrNull) => Id;
    listenToStartTransaction: (id: Id) => Id;
    listenToWillFinishTransaction: (id: Id) => Id;
    listenToDidFinishTransaction: (id: Id) => Id;
  }>;

export type MetricsListener = Listener &
  Readonly<{
    listenToMetricIds: (id: Id) => Id;
    listenToMetric: (id: Id, metricId: IdOrNull) => Id;
  }>;

export type IndexesListener = Listener &
  Readonly<{
    listenToIndexIds: (id: Id) => Id;
    listenToSliceIds: (id: Id, indexId: IdOrNull) => Id;
    listenToSliceRowIds: (id: Id, indexId: IdOrNull, sliceId: IdOrNull) => Id;
  }>;

export type RelationshipsListener = Listener &
  Readonly<{
    listenToRelationshipIds: (id: Id) => Id;
    listenToRemoteRowId: (
      id: Id,
      relationshipId: IdOrNull,
      localRowId: IdOrNull,
    ) => Id;
    listenToLocalRowIds: (
      id: Id,
      relationshipId: IdOrNull,
      remoteRowId: IdOrNull,
    ) => Id;
    listenToLinkedRowIds: (id: Id, relationshipId: Id, firstRowId: Id) => Id;
  }>;

export type QueriesListener = Listener &
  Readonly<{
    listenToQueryIds: (id: Id) => Id;
    listenToResultTable: (id: Id, queryId: IdOrNull) => Id;
    listenToResultTableCellIds: (id: Id, queryId: IdOrNull) => Id;
    listenToResultRowCount: (id: Id, queryId: IdOrNull) => Id;
    listenToResultRowIds: (id: Id, queryId: IdOrNull) => Id;
    listenToResultSortedRowIds: (
      id: Id,
      queryId: Id,
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
      limit: number | undefined,
    ) => Id;
    listenToResultRow: (id: Id, queryId: IdOrNull, rowId: IdOrNull) => Id;
    listenToResultCellIds: (id: Id, queryId: IdOrNull, rowId: IdOrNull) => Id;
    listenToResultCell: (
      id: Id,
      queryId: IdOrNull,
      rowId: IdOrNull,
      cellId: IdOrNull,
    ) => Id;
  }>;

export type CheckpointsListener = Listener &
  Readonly<{
    listenToCheckpoints: (id: Id) => Id;
    listenToCheckpoint: (id: Id, checkpointId: IdOrNull) => Id;
  }>;
