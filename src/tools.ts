import {StoreStats, Tools, createTools as createToolsDecl} from './tools.d';
import {Store} from './store.d';
import {getCreateFunction} from './common/definable';
import {objFreeze} from './common/obj';

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
        jsonLength: store.getJson().length,
        ...(detail ? {detail: {tables}} : {}),
      };
    };

    const tools: Tools = {
      getStoreStats,
    };

    return objFreeze(tools);
  },
);
