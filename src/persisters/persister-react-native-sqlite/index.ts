import type {MergeableStore} from '../../@types/mergeable-store/index.js';
import type {DatabasePersisterConfig} from '../../@types/persisters/index.js';
import type {
  ReactNativeSqlitePersister,
  createReactNativeSqlitePersister as createReactNativeSqlitePersisterDecl,
} from '../../@types/persisters/persister-react-native-sqlite/index.js';
import type {Store} from '../../@types/store/index.js';
import {IdObj} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {createCustomSqlitePersister} from '../common/database/sqlite.ts';

import {type SQLiteDatabase} from 'react-native-sqlite-storage';

export const createReactNativeSqlitePersister = ((
  store: Store | MergeableStore,
  db: SQLiteDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): ReactNativeSqlitePersister =>
  createCustomSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, params: any[] = []): Promise<IdObj<any>[]> =>
      (await db.executeSql(sql, params))[0].rows.raw(),
    noop,
    noop,
    onSqlCommand,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    db,
  ) as ReactNativeSqlitePersister) as typeof createReactNativeSqlitePersisterDecl;
