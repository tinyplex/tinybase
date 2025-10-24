import type {Database} from 'bun:sqlite';
import type {Id, Ids, Indexes, Metrics, Relationships} from 'tinybase';
import {IdObj, IdObj2} from './types.ts';

export const isBun = process.versions.bun != null;

export const AsyncFunction = Object.getPrototypeOf(
  async () => null,
).constructor;

export const importBunSqlite = new AsyncFunction(
  `return await import('bun:sqlite')`, // hide from Vitest static analysis
) as () => Promise<{Database: typeof Database}>;

export const pause = async (ms = 50): Promise<void> =>
  new Promise<void>((resolve) =>
    setTimeout(
      () => setTimeout(() => setTimeout(resolve, 1), Math.max(ms - 2, 1)),
      1,
    ),
  );

export const noop = () => undefined;

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
      .getRowIds(relationships.getLocalTableId(relationshipId) as string)
      .forEach((rowId) => {
        const remoteRowId = relationships.getRemoteRowId(relationshipId, rowId);
        if (remoteRowId != null) {
          relationshipsObject[relationshipId][0][rowId] = remoteRowId;
        }
      });
    store
      .getRowIds(relationships.getRemoteTableId(relationshipId) as string)
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

export const suppressWarnings = async <Return>(
  actions: () => Promise<Return>,
) => {
  /* eslint-disable no-console */
  const log = console.log;
  const warn = console.warn;
  const error = console.error;
  console.log = (...args: any[]) => (ignorable(...args) ? 0 : log(...args));
  console.warn = (...args: any[]) => (ignorable(...args) ? 0 : warn(...args));
  console.error = (...args: any[]) => (ignorable(...args) ? 0 : error(...args));
  const result = await actions();
  console.log = log;
  console.warn = warn;
  console.error = error;
  /* eslint-enable no-console */
  return result;
};
const ignorable = (...args: any[]): boolean =>
  args.some((arg) =>
    arg
      .toString()
      .match(/wasm|OPFS|ArrayBuffer|ReactDOMTestUtils|C-web|onCustomMessage/),
  );
