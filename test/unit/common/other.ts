import type {Database} from 'bun:sqlite';
import type {Id, Ids, Indexes, Metrics, Relationships} from 'tinybase';
import * as vitest from 'vitest';
import {IdObj, IdObj2} from './types.ts';

export const isBun = process.versions.bun != null;

// Provided by each vitest project: the '-servers' projects run the database
// variants and documentation examples that need a local PostgreSQL or SQL
// Server, and every other project leaves them out. Bun aliases 'vitest' to
// 'bun:test', which has no inject, so it is reached through the namespace
// rather than a named import - and it never runs those variants anyway.
export const withServers: boolean = isBun
  ? false
  : (vitest as {inject?: (key: 'servers') => boolean}).inject?.('servers') ==
    true;

// The local SQL Server these tests expect, given the same treatment as the
// PostgreSQL URL in databases.ts. PostgreSQL can use trust authentication and
// so needs no password; SQL Server cannot, so one is spelled out here. It is
// the password of a throwaway container holding nothing but test data, never
// a real instance:
//
//   docker run -d --name tinybase-mssql -p 1433:1433 \
//     -e ACCEPT_EULA=Y -e MSSQL_PID=Developer \
//     -e MSSQL_SA_PASSWORD='TinyBase!Passw0rd' \
//     mcr.microsoft.com/mssql/server:2022-latest
//
// Point any part of it somewhere else with the matching variable.
export const MSSQL_SERVER = process.env.TINYBASE_MSSQL_SERVER ?? 'localhost';
export const MSSQL_PORT = Number(process.env.TINYBASE_MSSQL_PORT ?? 1433);
export const MSSQL_USER = process.env.TINYBASE_MSSQL_USER ?? 'sa';
export const MSSQL_PASSWORD =
  process.env.TINYBASE_MSSQL_PASSWORD ?? 'TinyBase!Passw0rd';
export const MSSQL_CONNECTION_STRING =
  `Server=${MSSQL_SERVER},${MSSQL_PORT};Database=tinybase;` +
  `User Id=${MSSQL_USER};Password=${MSSQL_PASSWORD};` +
  `Encrypt=false;TrustServerCertificate=true`;

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

export const waitFor = async (
  assertion: () => void | Promise<void>,
  intervalMilliseconds = 5,
  timeoutMilliseconds = 10000,
): Promise<void> => {
  const deadline = Date.now() + timeoutMilliseconds;
  for (;;) {
    try {
      await assertion();
      return;
    } catch (error) {
      if (Date.now() >= deadline) {
        throw error;
      }
    }
    await pause(intervalMilliseconds);
  }
};

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
