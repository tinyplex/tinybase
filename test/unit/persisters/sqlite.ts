export type Dump = [
  name: string,
  sql: string,
  rows: {[column: string]: any}[],
][];

const escapeId = (str: string) => `"${str.replace(/"/g, '""')}"`;

export const getDatabaseFunctions = <Database>(
  cmd: (
    db: Database,
    sql: string,
    args?: any[],
  ) => Promise<{[id: string]: any}[]>,
): [
  (db: Database) => Promise<Dump>,
  (db: Database, dump: Dump) => Promise<void>,
] => {
  const getDatabase = async (db: Database): Promise<Dump> =>
    await Promise.all(
      (
        await cmd(
          db,
          `SELECT sql, name FROM sqlite_schema WHERE type = 'table'`,
        )
      ).map(async ({sql, name}: any) => [
        name,
        sql,
        await cmd(db, 'SELECT * FROM ' + escapeId(name)),
      ]),
    );

  const setDatabase = async (db: Database, dump: Dump) => {
    await cmd(db, 'BEGIN TRANSACTION');
    await Promise.all(
      dump.map(async ([name, sql, rows]) => {
        await cmd(db, sql);
        await Promise.all(
          rows.map(
            async (row) =>
              await cmd(
                db,
                'INSERT INTO ' +
                  escapeId(name) +
                  '(' +
                  Object.keys(row)
                    .map((cellId) => escapeId(cellId))
                    .join(',') +
                  ') VALUES (' +
                  Object.keys(row)
                    .map(() => '?')
                    .join(',') +
                  ')',
                Object.values(row),
              ),
          ),
        );
      }),
    );
    await cmd(db, 'END TRANSACTION');
  };

  return [getDatabase, setDatabase];
};
