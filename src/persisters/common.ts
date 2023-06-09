import {Tables, Values} from '../types/store';
import {jsonParse, jsonString} from '../common/other';

export const getSqlitePersistedFunctions = (
  run: (sql: string, args?: any[]) => Promise<void>,
  get: (sql: string) => Promise<any[][]>,
): [
  () => Promise<[Tables, Values]>,
  (getContent: () => [Tables, Values]) => Promise<void>,
] => {
  const ensureTable = async (): Promise<void> =>
    await run('CREATE TABLE IF NOT EXISTS tinybase(json);');

  const getPersisted = async (): Promise<[Tables, Values]> => {
    await ensureTable();
    return jsonParse((await get('SELECT json FROM tinybase LIMIT 1'))[0][0]);
  };

  const setPersisted = async (
    getContent: () => [Tables, Values],
  ): Promise<void> => {
    try {
      await ensureTable();
      await run(
        'INSERT INTO tinybase(rowId, json) VALUES (1, ?) ON CONFLICT DO ' +
          'UPDATE SET json=excluded.json',
        [jsonString(getContent())],
      );
    } catch {}
  };

  return [getPersisted, setPersisted];
};
