import {Tables, Values} from '../types/store';
import {isString, jsonParse, jsonString} from '../common/other';
import {DatabasePersisterConfig} from '../types/persisters';
import {TINYBASE} from '../common/strings';

export const getSqlitePersistedFunctions = (
  storeTableOrConfig: string | DatabasePersisterConfig | undefined,
  run: (sql: string, args?: any[]) => Promise<void>,
  get: (sql: string) => Promise<any[][]>,
): [
  () => Promise<[Tables, Values]>,
  (getContent: () => [Tables, Values]) => Promise<void>,
] => {
  const config: DatabasePersisterConfig = isString(storeTableOrConfig)
    ? {storeTable: storeTableOrConfig}
    : storeTableOrConfig ?? {};

  const {storeTable = TINYBASE} = config;

  const ensureTable = async (): Promise<void> =>
    await run(`CREATE TABLE IF NOT EXISTS "${storeTable}" (json);`);

  const getPersisted = async (): Promise<[Tables, Values]> => {
    await ensureTable();
    return jsonParse(
      (await get(`SELECT json FROM "${storeTable}" LIMIT 1`))[0][0],
    );
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      await ensureTable();
      await run(
        `INSERT INTO "${storeTable}" (rowId, json) VALUES (1, ?) ` +
          'ON CONFLICT DO UPDATE SET json=excluded.json',
        [jsonString(getContent())],
      );
    } catch {}
  };

  return [getPersisted, setPersisted];
};
