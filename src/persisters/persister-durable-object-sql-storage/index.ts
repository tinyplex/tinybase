import type {MergeableStore} from '../../@types/mergeable-store/index.js';

import type {DatabasePersisterConfig} from '../../@types/persisters/index.d.ts';
import type {
  createDurableObjectSqlStoragePersister as createDurableObjectSqlStoragePersisterDecl,
  DurableObjectSqlStoragePersister,
} from '../../@types/persisters/persister-durable-object-sql-storage/index.d.ts';
import {IdObj} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

type UnsubscribeFunction = () => void;

export const createDurableObjectSqlStoragePersister = ((
  store: MergeableStore,
  sqlStorage: SqlStorage,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): DurableObjectSqlStoragePersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> => {
      if (!['BEGIN', 'END'].includes(sql)) {
        //in sql replace $1, $2, $3, etc. with a question mark
        sql = sql.replace(/\$\d+/g, '?');
        return sqlStorage.exec(sql, ...params).toArray();
      }
      return [];
    },
    (): UnsubscribeFunction => noop,
    (unsubscribeFunction: UnsubscribeFunction): any => unsubscribeFunction(),
    onSqlCommand,
    onIgnoredError,
    noop,
    2, // MergeableStoreOnly,
    sqlStorage,
    'getSqlStorage',
  ) as DurableObjectSqlStoragePersister) as typeof createDurableObjectSqlStoragePersisterDecl;
