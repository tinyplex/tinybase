import {Cell, Store, TablesSchema} from './store.d';
import {DEFAULT, TYPE} from './common/strings';
import {IdMap, mapEnsure, mapNew, mapSet} from './common/map';
import {StoreStats, Tools, createTools as createToolsDecl} from './tools.d';
import {arrayEvery, arrayLength, arrayMap} from './common/array';
import {formatJsDoc, length} from './tools/code';
import {objFreeze, objIsEmpty} from './common/obj';
import {collForEach} from './common/coll';
import {getCellType} from './common/cell';
import {getCreateFunction} from './common/definable';
import {getStoreApi as getStoreApiImpl} from './tools/api';
import {jsonParse} from './common/other';

type CellMeta = [string, IdMap<number>, [number, Cell?], number];

const prettierConfig = {
  parser: 'typescript',
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  jsdocSingleLineComment: false,
} as any;

export const createTools: typeof createToolsDecl = getCreateFunction(
  (store: Store): Tools => {
    const getStoreStats = (detail?: boolean): StoreStats => {
      let totalTables = 0;
      let totalRows = 0;
      let totalCells = 0;
      const tables: any = {};

      store.forEachTable((tableId, forEachRow) => {
        totalTables++;
        let tableRows = 0;
        let tableCells = 0;
        const rows: any = {};

        forEachRow((rowId, forEachCell) => {
          tableRows++;
          let rowCells = 0;

          forEachCell(() => rowCells++);

          tableCells += rowCells;
          if (detail) {
            rows[rowId] = {rowCells};
          }
        });

        totalRows += tableRows;
        totalCells += tableCells;
        if (detail) {
          tables[tableId] = {tableRows, tableCells, rows};
        }
      });

      return {
        totalTables,
        totalRows,
        totalCells,
        jsonLength: length(store.getTablesJson()),
        ...(detail ? {detail: {tables}} : {}),
      };
    };

    const getStoreTablesSchema = (): TablesSchema => {
      const tablesSchema: TablesSchema = jsonParse(store.getTablesSchemaJson());
      if (
        !objIsEmpty(tablesSchema) ||
        arrayEvery(store.getTableIds(), (tableId): any => {
          const rowIds = store.getRowIds(tableId);
          const cellsMeta: IdMap<CellMeta> = mapNew();
          if (
            arrayEvery(rowIds, (rowId) =>
              arrayEvery(store.getCellIds(tableId, rowId), (cellId) => {
                const value = store.getCell(tableId, rowId, cellId) as Cell;
                const cellMeta: CellMeta = mapEnsure(cellsMeta, cellId, () => [
                  getCellType(value) as string,
                  mapNew(),
                  [0],
                  0,
                ]);
                const [type, values, [maxCount]] = cellMeta;
                const count = (mapEnsure(values, value, () => 0) as number) + 1;
                if (count > maxCount) {
                  cellMeta[2] = [count, value];
                }
                mapSet(values, value, count);
                cellMeta[3]++;
                return type == getCellType(value);
              }),
            )
          ) {
            tablesSchema[tableId] = {};
            collForEach(cellsMeta, ([type, , [, maxValue], count], cellId) => {
              tablesSchema[tableId][cellId] = {
                [TYPE]: type as any,
                ...(count == arrayLength(rowIds) ? {[DEFAULT]: maxValue} : {}),
              };
            });
            return 1;
          }
        })
      ) {
        return tablesSchema;
      }
      return {};
    };

    const getStoreApi = (module: string): [string, string] =>
      getStoreApiImpl(getStoreTablesSchema(), module);

    const getPrettyStoreApi = async (
      module: string,
    ): Promise<[string, string]> => {
      let format: (str: string, _config: any) => string;
      try {
        format = (await import('prettier')).format;
      } catch {
        format = (str) => str;
      }
      return arrayMap(getStoreApi(module), (file) =>
        formatJsDoc(format(file, prettierConfig)),
      ) as [string, string];
    };

    const tools: Tools = {
      getStoreStats,
      getStoreTablesSchema,
      getStoreApi,
      getPrettyStoreApi,
    };

    return objFreeze(tools);
  },
);
