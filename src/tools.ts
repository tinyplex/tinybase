import {StoreStats, Tools, createTools as createToolsDecl} from './tools.d';
import {Store} from './store.d';
import {getCreateFunction} from './common/definable';
import {objFreeze} from './common/obj';

export const createTools: typeof createToolsDecl = getCreateFunction(
  (store: Store): Tools => {
    const getStoreStats = (): StoreStats => {
      let totalTables = 0;
      let totalRows = 0;
      let totalCells = 0;

      store.forEachTable((_tableId, forEachRow) => {
        totalTables++;
        forEachRow((_rowId, forEachCell) => {
          totalRows++;
          forEachCell(() => totalCells++);
        });
      });

      return {
        totalTables,
        totalRows,
        totalCells,
        jsonLength: store.getJson().length,
      };
    };

    const tools: Tools = {
      getStoreStats,
    };

    return objFreeze(tools);
  },
);
