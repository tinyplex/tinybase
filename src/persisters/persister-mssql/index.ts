import type {ConnectionPool, Request} from 'mssql';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  DatabaseExecuteCommand,
  DatabasePersisterConfig,
} from '../../@types/persisters/index.d.ts';
import type {
  MsSqlPersister,
  createMsSqlPersister as createMsSqlPersisterDecl,
} from '../../@types/persisters/persister-mssql/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {arrayForEach} from '../../common/array.ts';
import {IdObj} from '../../common/obj.ts';
import {noop} from '../../common/other.ts';
import {createCustomMsSqlPersister} from '../common/database/mssql.ts';

// The shared code emits positional parameters as @p1, @p2, and so on, which
// the driver binds by name.
const getExecuteCommand =
  (getRequest: () => Request): DatabaseExecuteCommand =>
  async (sql: string, params: any[] = []): Promise<IdObj<any>[]> => {
    const request = getRequest();
    arrayForEach(params, (param, index) =>
      request.input('p' + (index + 1), param),
    );
    return (await request.query(sql)).recordset ?? [];
  };

export const createMsSqlPersister = (async (
  store: Store | MergeableStore,
  mssql: ConnectionPool,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, params?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): Promise<MsSqlPersister> =>
  createCustomMsSqlPersister(
    store,
    configOrStoreTableName,
    getExecuteCommand(() => mssql.request()),
    onSqlCommand,
    onIgnoredError,
    noop,
    3, // StoreOrMergeableStore,
    mssql,
    'getMsSql',
    // A Transaction takes its own connection from the pool, so unlike other
    // drivers there is no need to reserve one up front.
    async (actions) => {
      const transaction = mssql.transaction();
      await transaction.begin();
      try {
        const result = await actions(
          getExecuteCommand(() => transaction.request()),
        );
        await transaction.commit();
        return result;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    },
  ) as MsSqlPersister) as typeof createMsSqlPersisterDecl;
