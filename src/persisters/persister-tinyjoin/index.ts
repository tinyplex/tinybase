import type {Client, JsonValue} from 'tinyjoin';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  DatabasePersisterConfig,
  PersisterListener,
  Persists,
} from '../../@types/persisters/index.d.ts';
import type {
  TinyJoinPersister,
  createTinyJoinPersister as createTinyJoinPersisterDecl,
} from '../../@types/persisters/persister-tinyjoin/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {arrayForEach, arrayMap, arrayPush} from '../../common/array.ts';
import {collValues} from '../../common/coll.ts';
import {
  ERROR_STORE_TYPE,
  errorThrow,
  tryCatchIgnore,
} from '../../common/error.ts';
import {jsonParse, jsonString} from '../../common/json.ts';
import {IdObj} from '../../common/obj.ts';
import {noop, promiseAll} from '../../common/other.ts';
import type {DatabaseTransaction} from '../common/database/commands.ts';
import {
  QuerySchema,
  SELECT_STAR_FROM,
  escapeId,
  getWrappedCommand,
  numberedPlaceholder,
  updateThenInsertUpsert,
} from '../common/database/common.ts';
import {getConfigStructures} from '../common/database/config.ts';
import {createJsonPersister} from '../common/database/json.ts';
import {createTabularPersister} from '../common/database/tabular.ts';

const LIMIT_0 = 'LIMIT 0';

export const createTinyJoinPersister = ((
  store: Store | MergeableStore,
  tinyJoin: Client,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): TinyJoinPersister => {
  const executeCommand = getWrappedCommand(
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      (await tinyJoin.query(sql, params as JsonValue[])).rows as IdObj<any>[],
    onSqlCommand,
  );

  const [isJson, , defaultedConfig, managedTableNamesSet] = getConfigStructures(
    configOrStoreTableName,
  );
  if (!isJson && store.isMergeable()) {
    errorThrow(ERROR_STORE_TYPE);
  }
  const managedTableNames = collValues(managedTableNamesSet);

  const querySchema: QuerySchema = async () => {
    const schema: {tn: string; cn: string}[] = [];
    await promiseAll(
      arrayMap(managedTableNames, async (tn) => {
        const sql = SELECT_STAR_FROM + escapeId(tn) + LIMIT_0;
        onSqlCommand?.(sql);
        await tryCatchIgnore(async () =>
          arrayForEach((await tinyJoin.query(sql)).fields, ({name}) =>
            arrayPush(schema, {tn, cn: name}),
          ),
        );
      }),
    );
    return schema;
  };

  const addPersisterListener = (
    listener: PersisterListener<Persists.StoreOrMergeableStore>,
  ): (() => void) =>
    tinyJoin.subscribe(
      {tables: managedTableNames},
      () => void tryCatchIgnore(listener, onIgnoredError),
    );

  const delPersisterListener = (unsubscribe: () => void): void => unsubscribe();

  const executeTransaction: DatabaseTransaction = (actions) =>
    actions(executeCommand);

  return (isJson ? createJsonPersister : createTabularPersister)(
    store,
    executeCommand,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    defaultedConfig as any,
    managedTableNames,
    querySchema,
    tinyJoin,
    'getTinyJoin',
    'text',
    numberedPlaceholder,
    updateThenInsertUpsert,
    (cellOrValue) => jsonString(cellOrValue),
    (field) => jsonParse(field as string),
    executeTransaction,
  ) as TinyJoinPersister;
}) as typeof createTinyJoinPersisterDecl;
