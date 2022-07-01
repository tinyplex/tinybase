declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toEqualWithOrder(expected: any): R;
    }
  }
}

import {
  Checkpoints,
  Id,
  IdOrNull,
  Ids,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from '../../lib/debug/tinybase';

type IdObj<Value> = {[id: string]: Value};
type IdObj2<Value> = IdObj<{[id: string]: Value}>;
type Logs = IdObj<any[]>;

type Listener = Readonly<{
  logs: Logs;
}>;

export type StoreListener = Listener &
  Readonly<{
    listenToTables: (id: Id) => Id;
    listenToTableIds: (id: Id, trackReorder?: boolean) => Id;
    listenToTable: (id: Id, tableId: IdOrNull) => Id;
    listenToRowIds: (id: Id, tableId: IdOrNull, trackReorder?: boolean) => Id;
    listenToRow: (id: Id, tableId: IdOrNull, rowId: IdOrNull) => Id;
    listenToCellIds: (
      id: Id,
      tableId: IdOrNull,
      rowId: IdOrNull,
      trackReorder?: boolean,
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

export const pause = async (ms = 50): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const expectChanges = (
  listener: Listener,
  id: Id,
  ...expectedChanges: any[]
): void => {
  const log: any[] = listener.logs[id];
  expectedChanges.forEach((expectedChange) =>
    expect(JSON.stringify(log.shift())).toEqual(JSON.stringify(expectedChange)),
  );
};

export const expectChangesNoJson = (
  listener: Listener,
  id: Id,
  ...expectedChanges: any[]
): void => {
  const log: any[] = listener.logs[id];
  expectedChanges.forEach((expectedChange) =>
    expect(log.shift()).toEqual(expectedChange),
  );
};

export const expectNoChanges = (listener: Listener): void => {
  Object.values(listener.logs).forEach((log) => expect(log).toHaveLength(0));
};

export const createStoreListener = (store: Store): StoreListener => {
  const logs: Logs = {};

  return Object.freeze({
    listenToTables: (id) => {
      logs[id] = [];
      return store.addTablesListener((store) =>
        logs[id].push(store.getTables()),
      );
    },

    listenToTableIds: (id, trackReorder) => {
      logs[id] = [];
      return store.addTableIdsListener(
        () => logs[id].push(store.getTableIds()),
        trackReorder,
      );
    },

    listenToTable: (id, tableId) => {
      logs[id] = [];
      return store.addTableListener(tableId, (store, tableId) =>
        logs[id].push({[tableId]: store.getTable(tableId)}),
      );
    },

    listenToRowIds: (id, tableId, trackReorder) => {
      logs[id] = [];
      return store.addRowIdsListener(
        tableId,
        (store, tableId) =>
          logs[id].push({[tableId]: store.getRowIds(tableId)}),
        trackReorder,
      );
    },

    listenToRow: (id, tableId, rowId) => {
      logs[id] = [];
      return store.addRowListener(tableId, rowId, (store, tableId, rowId) =>
        logs[id].push({[tableId]: {[rowId]: store.getRow(tableId, rowId)}}),
      );
    },

    listenToCellIds: (id, tableId, rowId, trackReorder) => {
      logs[id] = [];
      return store.addCellIdsListener(
        tableId,
        rowId,
        (store, tableId, rowId) =>
          logs[id].push({
            [tableId]: {[rowId]: store.getCellIds(tableId, rowId)},
          }),
        trackReorder,
      );
    },

    listenToCell: (id, tableId, rowId, cellId) => {
      logs[id] = [];
      return store.addCellListener(
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

    listenToWillFinishTransaction: (id) => {
      logs[id] = [];
      return store.addWillFinishTransactionListener((_, cellsChanged) =>
        logs[id].push(cellsChanged),
      );
    },

    listenToDidFinishTransaction: (id) => {
      logs[id] = [];
      return store.addDidFinishTransactionListener((_, cellsChanged) =>
        logs[id].push(cellsChanged),
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

    listenToResultRowIds: (id, tableId) => {
      logs[id] = [];
      return queries.addResultRowIdsListener(
        tableId,
        (queries, tableId): number =>
          logs[id].push({[tableId]: queries.getResultRowIds(tableId)}),
      );
    },

    listenToResultRow: (id, tableId, rowId) => {
      logs[id] = [];
      return queries.addResultRowListener(
        tableId,
        rowId,
        (queries, tableId, rowId): number =>
          logs[id].push({
            [tableId]: {[rowId]: queries.getResultRow(tableId, rowId)},
          }),
      );
    },

    listenToResultCellIds: (id, tableId, rowId) => {
      logs[id] = [];
      return queries.addResultCellIdsListener(
        tableId,
        rowId,
        (queries, tableId, rowId): number =>
          logs[id].push({
            [tableId]: {[rowId]: queries.getResultCellIds(tableId, rowId)},
          }),
      );
    },

    listenToResultCell: (id, tableId, rowId, cellId) => {
      logs[id] = [];
      return queries.addResultCellListener(
        tableId,
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

export const getMetricsObject = (
  metrics: Metrics,
): IdObj<number | undefined> => {
  const metricsObject: IdObj<number | undefined> = {};
  metrics.forEachMetric(
    (metricId) => (metricsObject[metricId] = metrics.getMetric(metricId)),
  );
  return metricsObject;
};

export const getIndexesObject = (indexes: Indexes): IdObj2<Ids> => {
  const indexesObject: IdObj2<Ids> = {};
  indexes.forEachIndex((indexId) => {
    indexesObject[indexId] = {};
    indexes
      .getSliceIds(indexId)
      .forEach(
        (sliceId) =>
          (indexesObject[indexId][sliceId] = indexes.getSliceRowIds(
            indexId,
            sliceId,
          )),
      );
  });
  return indexesObject;
};

export const getRelationshipsObject = (
  relationships: Relationships,
): IdObj<[IdObj<Id>, IdObj<Ids>]> => {
  const store = relationships.getStore();
  const relationshipsObject: IdObj<[IdObj<Id>, IdObj<Ids>]> = {};
  relationships.forEachRelationship((relationshipId) => {
    relationshipsObject[relationshipId] = [{}, {}];
    store
      .getRowIds(relationships.getLocalTableId(relationshipId))
      .forEach((rowId) => {
        const remoteRowId = relationships.getRemoteRowId(relationshipId, rowId);
        if (remoteRowId != null) {
          relationshipsObject[relationshipId][0][rowId] = remoteRowId;
        }
      });
    store
      .getRowIds(relationships.getRemoteTableId(relationshipId))
      .forEach((remoteRowId) => {
        const localRowIds = relationships.getLocalRowIds(
          relationshipId,
          remoteRowId,
        );
        if (localRowIds.length > 0) {
          relationshipsObject[relationshipId][1][remoteRowId] = localRowIds;
        }
      });
  });
  return relationshipsObject;
};

expect.extend({
  toEqualWithOrder: (received, expected) =>
    JSON.stringify(received) === JSON.stringify(expected)
      ? {
          message: () =>
            `expected ${JSON.stringify(
              received,
            )} not to order-equal ${JSON.stringify(expected)}`,
          pass: true,
        }
      : {
          message: () =>
            `expected ${JSON.stringify(
              received,
            )} to order-equal ${JSON.stringify(expected)}`,
          pass: false,
        },
});
