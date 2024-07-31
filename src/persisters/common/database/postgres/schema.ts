import {Cmd, SELECT, getPlaceholders} from '../common.ts';

const WHERE = 'WHERE';

export const querySchema = async (
  cmd: Cmd,
  managedTableNames: string[],
): Promise<any[]> =>
  await cmd(
    // eslint-disable-next-line max-len
    `${SELECT} table_name tn,column_name cn FROM information_schema.columns ${WHERE} table_schema='public'AND table_name IN(${getPlaceholders(managedTableNames)})`,
    managedTableNames,
  );
