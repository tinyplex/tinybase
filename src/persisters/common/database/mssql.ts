import type {
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
  PersistedStore,
  Persister,
  PersisterListener,
  Persists,
} from '../../../@types/persisters/index.d.ts';
import {arrayJoin, arrayMap} from '../../../common/array.ts';
import {collValues} from '../../../common/coll.ts';
import {
  ERROR_STORE_TYPE,
  errorThrow,
  tryCatch,
  tryCatchIgnore,
  tryFinallyAsync,
} from '../../../common/error.ts';
import {jsonParse, jsonString} from '../../../common/json.ts';
import {objToArray} from '../../../common/obj.ts';
import {
  isEmpty,
  isUndefined,
  startInterval,
  stopInterval,
} from '../../../common/other.ts';
import {COMMA, EMPTY_STRING} from '../../../common/strings.ts';
import {DatabaseTransaction} from './commands.ts';
import {
  type Dialect,
  escapeColumnNames,
  escapeId,
  GetPlaceholder,
  getPlaceholders,
  getWrappedCommand,
  INSERT,
  SELECT,
  SINGLE_ROW_ID,
  UPDATE,
  Upsert,
  WHERE,
} from './common.ts';
import {DefaultedJsonConfig, getConfigStructures} from './config.ts';
import {createJsonPersister} from './json.ts';

// SQL Server generates and maintains this itself on every insert and update,
// including ones made by other clients, which is what makes it a sound and
// very cheap signal to poll for auto-loading.
const VERSION_COLUMN_NAME = '_version';
const ROWVERSION = 'rowversion';
// The type rowversion reports itself as in INFORMATION_SCHEMA.
const TIMESTAMP = 'timestamp';
// nvarchar(max) cannot be indexed, so the row Id column gets the widest type
// that still fits SQL Server's 900-byte index key limit.
const ROW_ID_COLUMN_TYPE = 'nvarchar(450)';
const COLUMN_TYPE = 'nvarchar(max)';
// T-SQL has no boolean literal.
const TRUE_CONDITION = '1=1';
const DROP_COLUMN = 'DROP COLUMN';
const MSSQL_DIALECT: Dialect = [
  TRUE_CONDITION,
  ROW_ID_COLUMN_TYPE,
  DROP_COLUMN,
];

const namedPlaceholder: GetPlaceholder = (offset) => '@p' + offset[0]++;

// SQL Server has no ON CONFLICT. HOLDLOCK is required to stop the match and
// the insert from racing each other under concurrency.
const mssqlUpsert: Upsert = async (
  executeCommand: DatabaseExecuteCommand,
  tableName: string,
  rowIdColumnName: string,
  changingColumnNames: string[],
  rows: {[id: string]: any[]},
  getPlaceholder: GetPlaceholder,
) => {
  const offset = [1];
  const escapedTableName = escapeId(tableName);
  const escapedRowIdColumnName = escapeId(rowIdColumnName);
  const escapedColumnNames = escapeColumnNames(
    rowIdColumnName,
    ...changingColumnNames,
  );
  await executeCommand(
    'MERGE INTO' +
      escapedTableName +
      ` WITH(HOLDLOCK)AS t USING(VALUES` +
      arrayJoin(
        objToArray(
          rows,
          (row: any[]) =>
            '(' +
            getPlaceholder(offset) +
            COMMA +
            getPlaceholders(row, getPlaceholder, offset) +
            ')',
        ),
        COMMA,
      ) +
      `)AS s(${escapedColumnNames})ON t.${escapedRowIdColumnName}` +
      `=s.${escapedRowIdColumnName}` +
      (isEmpty(changingColumnNames)
        ? EMPTY_STRING
        : ` WHEN MATCHED THEN ${UPDATE} SET ` +
          arrayJoin(
            arrayMap(
              changingColumnNames,
              (columnName) =>
                't.' + escapeId(columnName) + '=s.' + escapeId(columnName),
            ),
            COMMA,
          )) +
      ` WHEN NOT MATCHED THEN ${INSERT}(${escapedColumnNames})VALUES(` +
      arrayJoin(
        arrayMap(
          [rowIdColumnName, ...changingColumnNames],
          (columnName) => 's.' + escapeId(columnName),
        ),
        COMMA,
      ) +
      ');',
    objToArray(rows, (row: any[], id: string) => [
      id,
      ...arrayMap(row, (value) => value ?? null),
    ]).flat(),
  );
};

export const createCustomMsSqlPersister = <
  Persist extends Persists = Persists.StoreOnly,
>(
  store: PersistedStore<Persist>,
  configOrStoreTableName: DatabasePersisterConfig | string | undefined,
  rawExecuteCommand: DatabaseExecuteCommand,
  onSqlCommand: ((sql: string, params?: any[]) => void) | undefined,
  onIgnoredError: ((error: any) => void) | undefined,
  destroy: () => void,
  persist: Persist,
  thing: any,
  getThing = 'getDb',
  executeTransaction?: DatabaseTransaction,
): Persister<Persist> => {
  const executeCommand = getWrappedCommand(rawExecuteCommand, onSqlCommand);

  // The shared fallback issues BEGIN and END, which are block delimiters
  // rather than transaction statements in T-SQL.
  const executeMsSqlTransaction: DatabaseTransaction = async (actions) => {
    await executeCommand('BEGIN TRANSACTION');
    try {
      const result = await actions(executeCommand);
      await executeCommand('COMMIT');
      return result;
    } catch (error) {
      await tryCatch(() => executeCommand('ROLLBACK'));
      throw error;
    }
  };

  const [
    isJson,
    autoLoadIntervalSeconds,
    defaultedConfig,
    managedTableNamesSet,
  ] = getConfigStructures(configOrStoreTableName);
  // This Persister only supports JSON serialization for now.
  if (!isJson) {
    errorThrow(ERROR_STORE_TYPE);
  }
  const [storeTableName, storeIdColumnName] =
    defaultedConfig as DefaultedJsonConfig;

  const escapedStoreTableName = escapeId(storeTableName);
  const escapedVersionColumnName = escapeId(VERSION_COLUMN_NAME);

  // Adding the column is only possible once the table itself exists, which the
  // shared save path creates. It is dropped along with the table whenever the
  // Store empties, so this runs again whenever the probe stops working.
  const addVersionColumn = async (): Promise<void> => {
    await executeCommand(
      `IF OBJECT_ID(@p1,'U')IS NOT NULL AND ` +
        `COL_LENGTH(@p1,'${VERSION_COLUMN_NAME}')IS NULL ALTER TABLE` +
        escapedStoreTableName +
        'ADD' +
        escapedVersionColumnName +
        ' ' +
        ROWVERSION,
      [storeTableName],
    );
  };

  const getVersion = async (): Promise<string | null> => {
    const rows = (await tryCatch(() =>
      executeCommand(
        SELECT +
          ` CONVERT(bigint,${escapedVersionColumnName}) v FROM` +
          escapedStoreTableName +
          WHERE +
          escapeId(storeIdColumnName) +
          '=@p1',
        [SINGLE_ROW_ID],
      ),
    )) as {[field: string]: any}[] | undefined;
    if (isUndefined(rows)) {
      // The table or the version column is missing; try to put it back.
      await tryCatchIgnore(addVersionColumn, onIgnoredError);
      return null;
    }
    const version = rows[0]?.v;
    return isUndefined(version) || version === null
      ? null
      : EMPTY_STRING + version;
  };

  const addPersisterListener = (
    listener: PersisterListener<Persist>,
  ): Promise<() => Promise<void>> => {
    let active = 1;
    let baselineReady = 0;
    let currentVersion: string | null = null;
    let interval: ReturnType<typeof startInterval> | undefined;
    let task: Promise<void> | undefined;

    const checkForChanges = async (notify = true) => {
      const version = await getVersion();
      if (active && version != currentVersion) {
        const shouldNotify = notify && baselineReady;
        currentVersion = version;
        if (shouldNotify && active) {
          await listener();
        }
      }
    };

    const stopPolling = () => {
      if (!isUndefined(interval)) {
        stopInterval(interval);
        interval = undefined;
      }
    };

    const startPolling = () => {
      if (active && isUndefined(interval)) {
        interval = startInterval(
          () => void run(true),
          autoLoadIntervalSeconds as number,
        );
      }
    };

    const run = (notify = false): Promise<void> => {
      if (task) {
        return task;
      }
      const newTask = tryFinallyAsync(
        () =>
          tryCatchIgnore(async () => {
            if (!baselineReady) {
              await addVersionColumn();
              await checkForChanges(false);
              baselineReady = 1;
            } else if (notify) {
              await checkForChanges();
            }
          }, onIgnoredError),
        () => {
          if (task == newTask) {
            task = undefined;
          }
          if (active) {
            startPolling();
          }
        },
      );
      task = newTask;
      return newTask;
    };

    return run().then(() => async () => {
      active = 0;
      stopPolling();
      await tryFinallyAsync(
        async () => await task,
        () => {
          currentVersion = null;
        },
      );
    });
  };

  const delPersisterListener = (
    stopPolling: () => void | Promise<void>,
  ): void | Promise<void> => stopPolling();

  return createJsonPersister(
    store,
    executeCommand,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    destroy,
    persist,
    defaultedConfig as DefaultedJsonConfig,
    collValues(managedTableNamesSet),
    async (
      executeCommand: DatabaseExecuteCommand,
      managedTableNames: string[],
    ): Promise<any[]> =>
      await executeCommand(
        SELECT +
          // Rowversion columns are excluded so that the shared schema handling
          // neither writes to them nor drops them as unaccounted for.
          // eslint-disable-next-line max-len
          ` c.TABLE_NAME tn,c.COLUMN_NAME cn,CASE WHEN tc.CONSTRAINT_TYPE IN('PRIMARY KEY','UNIQUE')AND(${SELECT} count(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu2 ${WHERE} kcu2.CONSTRAINT_SCHEMA=kcu.CONSTRAINT_SCHEMA AND kcu2.CONSTRAINT_NAME=kcu.CONSTRAINT_NAME)=1 THEN 1 ELSE 0 END uq FROM INFORMATION_SCHEMA.COLUMNS c LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON kcu.TABLE_SCHEMA=c.TABLE_SCHEMA AND kcu.TABLE_NAME=c.TABLE_NAME AND kcu.COLUMN_NAME=c.COLUMN_NAME LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc ON tc.CONSTRAINT_SCHEMA=kcu.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_NAME=kcu.CONSTRAINT_NAME ${WHERE} c.TABLE_SCHEMA=SCHEMA_NAME()AND c.DATA_TYPE<>'${TIMESTAMP}'AND c.TABLE_NAME IN(${getPlaceholders(managedTableNames, namedPlaceholder)})`,
        managedTableNames,
      ),
    thing,
    getThing,
    COLUMN_TYPE,
    namedPlaceholder,
    mssqlUpsert,
    (cellOrValue: any) => jsonString(cellOrValue),
    (field: string | number) => jsonParse(field as string),
    executeTransaction ?? executeMsSqlTransaction,
    MSSQL_DIALECT,
  );
};
