import {
  PowerSyncPersister,
  createPowerSyncPersister as createPowerSyncPersisterDecl,
} from '../types/persisters/persister-powersync';
import {UpdateListener, createSqlitePersister} from './sqlite/create';
import {AbstractPowerSyncDatabase} from '@journeyapps/powersync-sdk-common';
import {DatabasePersisterConfig} from '../types/persisters';
import {IdObj} from '../common/obj';
import {Store} from '../types/store';
import {promiseNew} from '../common/other';

const _CHANGE = 'change';

type Observer = (_: any, _2: any, tableName: string) => void;

export const createPowerSyncPersister = ((
  store: Store,
  db: AbstractPowerSyncDatabase,
  configOrStoreTableName?: DatabasePersisterConfig | string,
  onSqlCommand?: (sql: string, args?: any[]) => void,
  onIgnoredError?: (error: any) => void,
): PowerSyncPersister =>
  createSqlitePersister(
    store,
    configOrStoreTableName,
    async (sql: string, args: any[] = []): Promise<IdObj<any>[]> =>
      await promiseNew(async (resolve, reject) => {
        const result = await db.execute(sql, args);

        result?.rows ? resolve(result.rows._array) : reject();
      }),
    (listener: UpdateListener): Observer => {
      const observer = (_: any, _2: any, tableName: string) =>
        listener(tableName);
      // const observer = db.onChange();

      const listen = async () => {
        for await (const event of db.onChange()) {
          for (const tableName of event.changedTables) {
            observer(null, null, tableName);
          }
        }
      };

      listen();

      // db.on(CHANGE, observer);
      return observer;
    },
    (_observer: Observer): any => null /* db.off(CHANGE, observer), */,
    onSqlCommand,
    onIgnoredError,
    db,
  ) as PowerSyncPersister) as typeof createPowerSyncPersisterDecl;
