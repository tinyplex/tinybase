import {
  Checkpoints,
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
import {
  NoSchemas,
  Store as StoreWithSchemas,
} from 'tinybase/debug/with-schemas';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toEqualWithOrder(expected: any): R;
    }
  }
}

export const createStoreListener = (
  store: Store | StoreWithSchemas<NoSchemas>,
): StoreListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToHasTables: (id) => {
      logs[id] = [];
      return store.addHasTablesListener((_, hasTables) =>
        logs[id].push(hasTables),
      );
    },

    listenToTables: (id) => {
      logs[id] = [];
      return store.addTablesListener((store) =>
        logs[id].push(store.getTables()),
      );
    },

    listenToTableIds: (id) => {
      logs[id] = [];
      return store.addTableIdsListener((store, getIdChanges) =>
        logs[id].push([store.getTableIds(), getIdChanges?.()]),
      );
    },

    listenToHasTable: (id, tableId) => {
      logs[id] = [];
      return store.addHasTableListener(tableId, (_, tableId, hasTable) =>
        logs[id].push({[tableId]: hasTable}),
      );
    },

    listenToTable: (id, tableId) => {
      logs[id] = [];
      return store.addTableListener(tableId, (store, tableId) =>
        logs[id].push({[tableId]: store.getTable(tableId)}),
      );
    },

    listenToTableCellIds: (id, tableId) => {
      logs[id] = [];
      return (store as Store).addTableCellIdsListener(
        tableId,
        (store, tableId, getIdChanges) =>
          logs[id].push({
            [tableId]: [store.getTableCellIds(tableId), getIdChanges?.()],
          }),
      );
    },

    listenToHasTableCell: (id, tableId, cellId) => {
      logs[id] = [];
      return (store as Store).addHasTableCellListener(
        tableId,
        cellId,
        (_, tableId, cellId, hasTableCell) =>
          logs[id].push({
            [tableId]: {[cellId]: hasTableCell},
          }),
      );
    },

    listenToRowCount: (id, tableId) => {
      logs[id] = [];
      return store.addRowCountListener(tableId, (store, tableId, count) =>
        logs[id].push({
          [tableId]: count,
        }),
      );
    },

    listenToRowIds: (id, tableId) => {
      logs[id] = [];
      return store.addRowIdsListener(tableId, (store, tableId, getIdChanges) =>
        logs[id].push({
          [tableId]: [store.getRowIds(tableId), getIdChanges?.()],
        }),
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

    listenToHasRow: (id, tableId, rowId) => {
      logs[id] = [];
      return store.addHasRowListener(
        tableId,
        rowId,
        (_, tableId, rowId, hasRow) =>
          logs[id].push({[tableId]: {[rowId]: hasRow}}),
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
      return (store as Store).addCellIdsListener(
        tableId,
        rowId,
        (store, tableId, rowId, getIdChanges) =>
          logs[id].push({
            [tableId]: {
              [rowId]: [store.getCellIds(tableId, rowId), getIdChanges?.()],
            },
          }),
      );
    },

    listenToHasCell: (id, tableId, rowId, cellId) => {
      logs[id] = [];
      return (store as Store).addHasCellListener(
        tableId,
        rowId,
        cellId,
        (_, tableId, rowId, cellId, hasCell) =>
          logs[id].push({[tableId]: {[rowId]: {[cellId]: hasCell}}}),
      );
    },

    listenToCell: (id, tableId, rowId, cellId) => {
      logs[id] = [];
      return (store as Store).addCellListener(
        tableId,
        rowId,
        cellId,
        (_, tableId, rowId, cellId, newCell) =>
          logs[id].push({[tableId]: {[rowId]: {[cellId]: newCell}}}),
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

    listenToHasValues: (id) => {
      logs[id] = [];
      return store.addHasValuesListener((_, hasValues) =>
        logs[id].push(hasValues),
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
      return store.addValueIdsListener((store, getIdChanges) =>
        logs[id].push([store.getValueIds(), getIdChanges?.()]),
      );
    },

    listenToHasValue: (id, valueId) => {
      logs[id] = [];
      return (store as Store).addHasValueListener(
        valueId,
        (_, valueId, hasValue) => logs[id].push({[valueId]: hasValue}),
      );
    },

    listenToValue: (id, valueId) => {
      logs[id] = [];
      return (store as Store).addValueListener(
        valueId,
        (_, valueId, newValue) => logs[id].push({[valueId]: newValue}),
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
      return store.addStartTransactionListener((store) => {
        logs[id].push([
          store.getTransactionChanges(),
          store.getTransactionLog(),
        ]);
      });
    },

    listenToWillFinishTransaction: (id) => {
      logs[id] = [];
      return store.addWillFinishTransactionListener((store) => {
        logs[id].push([
          store.getTransactionChanges(),
          store.getTransactionLog(),
        ]);
      });
    },

    listenToDidFinishTransaction: (id) => {
      logs[id] = [];
      return store.addDidFinishTransactionListener((store) => {
        logs[id].push([
          store.getTransactionChanges(),
          store.getTransactionLog(),
        ]);
      });
    },

    logs,
  });
};

export const createMetricsListener = (metrics: Metrics): MetricsListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToMetricIds: (id) => {
      logs[id] = [];
      return metrics.addMetricIdsListener((metrics) =>
        logs[id].push(metrics.getMetricIds()),
      );
    },

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
    listenToIndexIds: (id) => {
      logs[id] = [];
      return indexes.addIndexIdsListener((indexes) =>
        logs[id].push(indexes.getIndexIds()),
      );
    },

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
    listenToRelationshipIds: (id) => {
      logs[id] = [];
      return relationships.addRelationshipIdsListener((relationships) =>
        logs[id].push(relationships.getRelationshipIds()),
      );
    },

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
    listenToQueryIds: (id) => {
      logs[id] = [];
      return queries.addQueryIdsListener((queries) =>
        logs[id].push(queries.getQueryIds()),
      );
    },

    listenToResultTable: (id, queryId) => {
      logs[id] = [];
      return queries.addResultTableListener(
        queryId,
        (queries, queryId): number =>
          logs[id].push({[queryId]: queries.getResultTable(queryId)}),
      );
    },

    listenToResultRowCount: (id, queryId) => {
      logs[id] = [];
      return queries.addResultRowCountListener(
        queryId,
        (_queries, queryId, count): number => logs[id].push({[queryId]: count}),
      );
    },

    listenToResultTableCellIds: (id, queryId) => {
      logs[id] = [];
      return queries.addResultTableCellIdsListener(
        queryId,
        (queries, queryId, getIdChanges): number =>
          logs[id].push({
            [queryId]: [
              queries.getResultTableCellIds(queryId),
              getIdChanges?.(),
            ],
          }),
      );
    },

    listenToResultRowIds: (id, queryId) => {
      logs[id] = [];
      return queries.addResultRowIdsListener(
        queryId,
        (queries, queryId, getIdChanges): number =>
          logs[id].push({
            [queryId]: [queries.getResultRowIds(queryId), getIdChanges?.()],
          }),
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
          _queryId,
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
        (queries, queryId, rowId): number =>
          logs[id].push({
            [queryId]: {[rowId]: queries.getResultRow(queryId, rowId)},
          }),
      );
    },

    listenToResultCellIds: (id, queryId, rowId) => {
      logs[id] = [];
      return queries.addResultCellIdsListener(
        queryId,
        rowId,
        (queries, queryId, rowId, getIdChanges): number =>
          logs[id].push({
            [queryId]: {
              [rowId]: [
                queries.getResultCellIds(queryId, rowId),
                getIdChanges?.(),
              ],
            },
          }),
      );
    },

    listenToResultCell: (id, queryId, rowId, cellId) => {
      logs[id] = [];
      return queries.addResultCellListener(
        queryId,
        rowId,
        cellId,
        (_, queryId, rowId, cellId, newCell): number =>
          logs[id].push({[queryId]: {[rowId]: {[cellId]: newCell}}}),
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
