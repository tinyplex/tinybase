import {Cmd, SELECT, getPlaceholders} from '../common.ts';

const FROM = 'FROM ';
const PRAGMA_TABLE = 'pragma_table_';
const WHERE = 'WHERE';

export const querySchema = async (
  cmd: Cmd,
  managedTableNames: string[],
): Promise<any[]> =>
  await cmd(
    // eslint-disable-next-line max-len
    `${SELECT} t.name tn,c.name cn ${FROM}${PRAGMA_TABLE}list()t,${PRAGMA_TABLE}info(t.name)c ${WHERE} t.schema='main'AND t.type IN('table','view')AND t.name IN(${getPlaceholders(managedTableNames)})ORDER BY t.name,c.name`,
    managedTableNames,
  );
