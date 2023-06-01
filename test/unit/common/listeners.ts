import {
  Cell,
  NoSchemas,
  Store as StoreWithSchemas,
  Value,
} from 'tinybase/debug/with-schemas';
import {
  Checkpoints,
  Id,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase/debug';
import {
  CheckpointsListener,
  IndexesListener,
  Logs,
  MetricsListener,
  QueriesListener,
  RelationshipsListener,
  StoreListener,
} from './types';

export const createStoreListener = (
  store: Store | StoreWithSchemas<NoSchemas>,
): StoreListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToTables: (id) => {
      logs[id] = [];
      return store.addTablesListener((store) =>
        logs[id].push(store.getTables()),
      );
    },

    listenToTableIds: (id) => {
      logs[id] = [];
      return store.addTableIdsListener(() =>
        logs[id].push(store.getTableIds()),
      );
    },

    listenToTable: (id, tableId) => {
      logs[id] = [];
      return store.addTableListener(tableId, (store, tableId) =>
        logs[id].push({[tableId]: store.getTable(tableId)}),
      );
    },

    listenToRowIds: (id, tableId) => {
      logs[id] = [];
      return store.addRowIdsListener(tableId, (store, tableId) =>
        logs[id].push({[tableId]: store.getRowIds(tableId)}),
      );
    },

    listenToSortedRowIds: (id, tableId, cellId, descending, offset, limit) => {
      logs[id] = [];
      return store.addSortedRowIdsListener(
        tableId,
        cellId,
        descending,
        offset,
        limit,
        (
          _store,
          _tableId,
          _cellId,
          _descending,
          _offset,
          _limit,
          sortedCellIds,
        ) => logs[id].push(sortedCellIds),
      );
    },

    listenToRow: (id, tableId, rowId) => {
      logs[id] = [];
      return store.addRowListener(tableId, rowId, (store, tableId, rowId) =>
        logs[id].push({[tableId]: {[rowId]: store.getRow(tableId, rowId)}}),
      );
    },

    listenToCellIds: (id, tableId, rowId) => {
      logs[id] = [];
      return store.addCellIdsListener(tableId, rowId, (store, tableId, rowId) =>
        logs[id].push({
          [tableId]: {[rowId]: store.getCellIds(tableId, rowId)},
        }),
      );
    },

    listenToCell: (id, tableId, rowId, cellId) => {
      logs[id] = [];
      return store.addCellListener(
        tableId,
        rowId,
        cellId,
        (
          _: any,
          tableId: Id,
          rowId: Id,
          cellId: Id,
          newCell: Cell<any, any, any>,
        ) => logs[id].push({[tableId]: {[rowId]: {[cellId]: newCell}}}),
      );
    },

    listenToInvalidCell: (id, tableId, rowId, cellId) => {
      logs[id] = [];
      return store.addInvalidCellListener(
        tableId,
        rowId,
        cellId,
        (_, tableId, rowId, cellId, invalidCells) =>
          logs[id].push({[tableId]: {[rowId]: {[cellId]: invalidCells}}}),
      );
    },

    listenToValues: (id) => {
      logs[id] = [];
      return store.addValuesListener((store) =>
        logs[id].push(store.getValues()),
      );
    },

    listenToValueIds: (id) => {
      logs[id] = [];
      return store.addValueIdsListener((store) =>
        logs[id].push(store.getValueIds()),
      );
    },

    listenToValue: (id, valueId) => {
      logs[id] = [];
      return store.addValueListener(
        valueId,
        (_: any, valueId: Id, newValue: Value<any, any, any>) =>
          logs[id].push({[valueId]: newValue}),
      );
    },

    listenToInvalidValue: (id, cellId) => {
      logs[id] = [];
      return store.addInvalidValueListener(
        cellId,
        (_, valueId, invalidValues) =>
          logs[id].push({[valueId]: invalidValues}),
      );
    },

    listenToStartTransaction: (id) => {
      logs[id] = [];
      return store.addStartTransactionListener(
        (_, getTransactionChanges, getTransactionLog) => {
          logs[id].push([getTransactionChanges(), getTransactionLog()]);
        },
      );
    },

    listenToWillFinishTransaction: (id) => {
      logs[id] = [];
      return store.addWillFinishTransactionListener(
        (_, getTransactionChanges, getTransactionLog) => {
          logs[id].push([getTransactionChanges(), getTransactionLog()]);
        },
      );
    },

    listenToDidFinishTransaction: (id) => {
      logs[id] = [];
      return store.addDidFinishTransactionListener(
        (_, getTransactionChanges, getTransactionLog) => {
          logs[id].push([getTransactionChanges(), getTransactionLog()]);
        },
      );
    },

    logs,
  });
};

export const createMetricsListener = (metrics: Metrics): MetricsListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToMetric: (id, metricId) => {
      logs[id] = [];
      return metrics.addMetricListener(metricId, (metrics, metricId) =>
        logs[id].push({[metricId]: metrics.getMetric(metricId)}),
      );
    },
    logs,
  });
};

export const createIndexesListener = (indexes: Indexes): IndexesListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToSliceIds: (id, indexId) => {
      logs[id] = [];
      return indexes.addSliceIdsListener(indexId, (indexes, indexId) =>
        logs[id].push({[indexId]: indexes.getSliceIds(indexId)}),
      );
    },

    listenToSliceRowIds: (id, indexId, sliceId) => {
      logs[id] = [];
      return indexes.addSliceRowIdsListener(
        indexId,
        sliceId,
        (indexes, indexId, sliceId) =>
          logs[id].push({
            [indexId]: {[sliceId]: indexes.getSliceRowIds(indexId, sliceId)},
          }),
      );
    },
    logs,
  });
};

export const createRelationshipsListener = (
  relationships: Relationships,
): RelationshipsListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToRemoteRowId: (id, relationshipId, localRowId) => {
      logs[id] = [];
      return relationships.addRemoteRowIdListener(
        relationshipId,
        localRowId,
        (relationships, relationshipId, localRowId) =>
          logs[id].push({
            [relationshipId]: {
              [localRowId]: relationships.getRemoteRowId(
                relationshipId,
                localRowId,
              ),
            },
          }),
      );
    },

    listenToLocalRowIds: (id, relationshipId, remoteRowId) => {
      logs[id] = [];
      return relationships.addLocalRowIdsListener(
        relationshipId,
        remoteRowId,
        (relationships, relationshipId, remoteRowId) =>
          logs[id].push({
            [relationshipId]: {
              [remoteRowId]: relationships.getLocalRowIds(
                relationshipId,
                remoteRowId,
              ),
            },
          }),
      );
    },

    listenToLinkedRowIds: (id, relationshipId, firstRowId) => {
      logs[id] = [];
      return relationships.addLinkedRowIdsListener(
        relationshipId,
        firstRowId,
        (relationships, relationshipId, firstRowId) =>
          logs[id].push({
            [relationshipId]: {
              [firstRowId]: relationships.getLinkedRowIds(
                relationshipId,
                firstRowId,
              ),
            },
          }),
      );
    },
    logs,
  });
};

export const createQueriesListener = (queries: Queries): QueriesListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToResultTable: (id, queryId) => {
      logs[id] = [];
      return queries.addResultTableListener(
        queryId,
        (queries, queryId): number =>
          logs[id].push({[queryId]: queries.getResultTable(queryId)}),
      );
    },

    listenToResultRowIds: (id, queryId) => {
      logs[id] = [];
      return queries.addResultRowIdsListener(
        queryId,
        (queries, tableId): number =>
          logs[id].push({[tableId]: queries.getResultRowIds(tableId)}),
      );
    },

    listenToResultSortedRowIds: (
      id,
      queryId,
      cellId,
      descending,
      offset,
      limit,
    ) => {
      logs[id] = [];
      return queries.addResultSortedRowIdsListener(
        queryId,
        cellId,
        descending,
        offset,
        limit,
        (
          _queries,
          _tableId,
          _cellId,
          _descending,
          _offset,
          _limit,
          sortedCellIds,
        ) => logs[id].push(sortedCellIds),
      );
    },

    listenToResultRow: (id, queryId, rowId) => {
      logs[id] = [];
      return queries.addResultRowListener(
        queryId,
        rowId,
        (queries, tableId, rowId): number =>
          logs[id].push({
            [tableId]: {[rowId]: queries.getResultRow(tableId, rowId)},
          }),
      );
    },

    listenToResultCellIds: (id, queryId, rowId) => {
      logs[id] = [];
      return queries.addResultCellIdsListener(
        queryId,
        rowId,
        (queries, tableId, rowId): number =>
          logs[id].push({
            [tableId]: {[rowId]: queries.getResultCellIds(tableId, rowId)},
          }),
      );
    },

    listenToResultCell: (id, queryId, rowId, cellId) => {
      logs[id] = [];
      return queries.addResultCellListener(
        queryId,
        rowId,
        cellId,
        (_, tableId, rowId, cellId, newCell): number =>
          logs[id].push({[tableId]: {[rowId]: {[cellId]: newCell}}}),
      );
    },
    logs,
  });
};

export const createCheckpointsListener = (
  checkpoints: Checkpoints,
): CheckpointsListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToCheckpoints: (id) => {
      logs[id] = [];
      return checkpoints.addCheckpointIdsListener(() =>
        logs[id].push(checkpoints.getCheckpointIds()),
      );
    },
    listenToCheckpoint: (id, checkpointId) => {
      logs[id] = [];
      return checkpoints.addCheckpointListener(
        checkpointId,
        (checkpoints, checkpointId) =>
          logs[id].push({
            [checkpointId]: checkpoints.getCheckpoint(checkpointId),
          }),
      );
    },
    logs,
  });
};
