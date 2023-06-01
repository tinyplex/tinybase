import {Id, IdOrNull} from 'tinybase/debug';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toEqualWithOrder(expected: any): R;
    }
  }
}

export type IdObj<Value> = {[id: string]: Value};
export type IdObj2<Value> = IdObj<{[id: string]: Value}>;
export type Logs = IdObj<any[]>;
export type Listener = Readonly<{logs: Logs}>;

export type StoreListener = Listener &
  Readonly<{
    listenToTables: (id: Id) => Id;
    listenToTableIds: (id: Id) => Id;
    listenToTable: (id: Id, tableId: IdOrNull) => Id;
    listenToRowIds: (id: Id, tableId: IdOrNull) => Id;
    listenToSortedRowIds: (
      id: Id,
      tableId: Id,
      cellId: Id | undefined,
      descending: boolean,
      offset: number,
      limit: number | undefined,
    ) => Id;
    listenToRow: (id: Id, tableId: IdOrNull, rowId: IdOrNull) => Id;
    listenToCellIds: (id: Id, tableId: IdOrNull, rowId: IdOrNull) => Id;
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
    listenToValues: (id: Id) => Id;
    listenToValueIds: (id: Id) => Id;
    listenToValue: (id: Id, valueId: IdOrNull) => Id;
    listenToInvalidValue: (id: Id, valueId: IdOrNull) => Id;
    listenToWillFinishTransaction: (id: Id) => Id;
    listenToDidFinishTransaction: (id: Id) => Id;
  }>;

export type MetricsListener = Listener &
  Readonly<{
    listenToMetric: (id: Id, metricId: IdOrNull) => Id;
  }>;

export type IndexesListener = Listener &
  Readonly<{
    listenToSliceIds: (id: Id, indexId: IdOrNull) => Id;
    listenToSliceRowIds: (id: Id, indexId: IdOrNull, sliceId: IdOrNull) => Id;
  }>;

export type RelationshipsListener = Listener &
  Readonly<{
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
    listenToResultTable: (id: Id, queryId: IdOrNull) => Id;
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
