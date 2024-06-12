/* eslint-disable @typescript-eslint/no-non-null-assertion */

// NB: an exclamation mark after a line visually indicates an expected TS error

import {createMergeableStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {c1: {type: 'number'}, c1d: {type: 'string', default: ''}},
} as const;

const valuesSchema = {
  v1: {type: 'number'},
  v1d: {type: 'string', default: ''},
} as const;

const oneValueSchema = {
  v1: {type: 'number'},
} as const;

const store = createMergeableStore('s1');

const storeWithSchemas = store.setSchema(tablesSchema, valuesSchema);
storeWithSchemas.setTables({t1: {r1: {c1: 1}}});

const storeWithSchemasOneValue = store.setSchema(tablesSchema, oneValueSchema);

// Getters
(() => {
  storeWithSchemas.getTables().t1;
  storeWithSchemas.getTables().t1!.r1!.c1 as number;
  storeWithSchemas.getTables().t1!.r1!.c1 as undefined;
  storeWithSchemas.getTables().t1!.r1!.c1d as string;
  storeWithSchemas.getTables().t1!.r1!.c1 as string; // !
  storeWithSchemas.getTables().t1!.r1!.c1d as undefined; // !
  storeWithSchemas.getTables().t1!.r1!.c2; // !
  storeWithSchemas.getTables().t2; // !
  storeWithSchemas.getTables().t2?.r1!.c1; // !

  storeWithSchemas.getTableIds().includes('t1');
  storeWithSchemas.getTableIds().includes('t2'); // !

  storeWithSchemas.hasTable('t1');
  storeWithSchemas.hasTable('t2'); // !

  storeWithSchemas.getTable('t1');
  storeWithSchemas.getTable('t1').r1!.c1 as number;
  storeWithSchemas.getTable('t1').r1!.c1 as undefined;
  storeWithSchemas.getTable('t1').r1!.c1d as string;
  storeWithSchemas.getTable('t1').r1!.c1 as string; // !
  storeWithSchemas.getTable('t1').r1!.c1d as undefined; // !
  storeWithSchemas.getTable('t2'); // !

  storeWithSchemas.hasTableCell('t1', 'c1');
  storeWithSchemas.hasTableCell('t1', 'c2'); // !
  storeWithSchemas.hasTableCell('t2', 'c2'); // !

  storeWithSchemas.getTableCellIds('t1');
  storeWithSchemas.getTableCellIds('t1').includes('c1');
  storeWithSchemas.getTableCellIds('t1').includes('c2'); // !
  storeWithSchemas.getTableCellIds('t2'); // !

  storeWithSchemas.getRowIds('t1');
  storeWithSchemas.getRowIds('t2'); // !

  storeWithSchemas.getRowCount('t1');
  storeWithSchemas.getRowCount('t2'); // !

  storeWithSchemas.getSortedRowIds('t1', 'c1');
  storeWithSchemas.getSortedRowIds('t1', 'c2'); // !
  storeWithSchemas.getSortedRowIds('t2', 'r2'); // !

  storeWithSchemas.hasRow('t1', 'r1');
  storeWithSchemas.hasRow('t2', 'r2'); // !

  storeWithSchemas.getRow('t1', 'r1');
  storeWithSchemas.getRow('t1', 'r1').c1 as number;
  storeWithSchemas.getRow('t1', 'r1').c1 as undefined;
  storeWithSchemas.getRow('t1', 'r1').c1d as string;
  storeWithSchemas.getRow('t1', 'r1').c1 as string; // !
  storeWithSchemas.getRow('t1', 'r1').c1d as undefined; // !
  storeWithSchemas.getRow('t2', 'r2'); // !

  storeWithSchemas.getCellIds('t1', 'r1').includes('c1');
  storeWithSchemas.getCellIds('t1', 'r1').includes('c2'); // !
  storeWithSchemas.getCellIds('t2', 'r2'); // !

  storeWithSchemas.hasCell('t1', 'r1', 'c1');
  storeWithSchemas.hasCell('t1', 'r1', 'c2'); // !
  storeWithSchemas.hasCell('t2', 'r2', 'c2'); // !

  storeWithSchemas.getCell('t1', 'r1', 'c1') as number;
  storeWithSchemas.getCell('t1', 'r1', 'c1') as undefined;
  storeWithSchemas.getCell('t1', 'r1', 'c1d') as string;
  storeWithSchemas.getCell('t1', 'r1', 'c1') as string; // !
  storeWithSchemas.getCell('t1', 'r1', 'c2'); // !
  storeWithSchemas.getCell('t2', 'r2', 'c2'); // !

  storeWithSchemas.getValues().v1;
  storeWithSchemas.getValues().v1 as number;
  storeWithSchemas.getValues().v1 as undefined;
  storeWithSchemas.getValues().v1d as string;
  storeWithSchemas.getValues().v1 as string; // !
  storeWithSchemas.getValues().v1d as undefined; // !
  storeWithSchemas.getValues().v2; // !

  storeWithSchemas.getValueIds().includes('v1');
  storeWithSchemas.getValueIds().includes('v2'); // !

  storeWithSchemas.hasValue('v1');
  storeWithSchemas.hasValue('v2'); // !

  storeWithSchemas.getValue('v1') as number;
  storeWithSchemas.getValue('v1') as undefined;
  storeWithSchemas.getValue('v1d') as string;
  storeWithSchemas.getValue('v1') as string; // !
  storeWithSchemas.getValue('v1d') as undefined; // !
  storeWithSchemas.getValue('v2'); // !
})();

// Setters & deleters
(() => {
  storeWithSchemas.setTables({t1: {r1: {c1: 1}}});
  storeWithSchemas.setTables({t1: {r1: {c2: 1}}}); // !
  storeWithSchemas.setTables({t1: {r1: {c1: 'a'}}}); // !
  storeWithSchemas.setTables({t2: {r2: {c2: 1}}}); // !

  storeWithSchemas.setTable('t1', {r1: {c1: 1}});
  storeWithSchemas.setTable('t1', {r1: {c2: 1}}); // !
  storeWithSchemas.setTable('t1', {r1: {c1: 'a'}}); // !
  storeWithSchemas.setTable('t2', {r2: {c2: 1}}); // !

  storeWithSchemas.delTable('t1');
  storeWithSchemas.delTable('t2'); // !

  storeWithSchemas.setRow('t1', 'r1', {c1: 1});
  storeWithSchemas.setRow('t1', 'r1', {c2: 1}); // !
  storeWithSchemas.setRow('t1', 'r1', {c1: 'a'}); // !
  storeWithSchemas.setRow('t2', 'r2', {c2: 1}); // !

  storeWithSchemas.addRow('t1', {c1: 1});
  storeWithSchemas.addRow('t1', {c2: 1}); // !
  storeWithSchemas.addRow('t1', {c1: 'a'}); // !
  storeWithSchemas.addRow('t2', {c2: 1}); // !

  storeWithSchemas.setPartialRow('t1', 'r1', {c1: 1});
  storeWithSchemas.setPartialRow('t1', 'r1', {c2: 1}); // !
  storeWithSchemas.setPartialRow('t1', 'r1', {c1: 'a'}); // !
  storeWithSchemas.setPartialRow('t2', 'r2', {c2: 1}); // !

  storeWithSchemas.delRow('t1', 'r1');
  storeWithSchemas.delRow('t2', 'r2'); // !

  storeWithSchemas.setCell('t1', 'r1', 'c1', 1);
  storeWithSchemas.setCell('t1', 'r1', 'c1', (cell) => (cell ?? 0) + 1);
  storeWithSchemas.setCell('t1', 'r1', 'c2', 1); // !
  storeWithSchemas.setCell('t1', 'r1', 'c1', 'a'); // !
  storeWithSchemas.setCell('t1', 'r1', 'c1', () => 'a'); // !
  storeWithSchemas.setCell('t2', 'r2', 'c2', 1); // !

  storeWithSchemas.delCell('t1', 'r1', 'c1');
  storeWithSchemas.delCell('t1', 'r1', 'c2'); // !
  storeWithSchemas.delCell('t2', 'r2', 'c2'); // !

  storeWithSchemas.setValues({v1: 1});
  storeWithSchemas.setValues({v1: 'a'}); // !
  storeWithSchemas.setValues({v2: 1}); // !

  storeWithSchemas.setPartialValues({v1: 1});
  storeWithSchemas.setPartialValues({v1: 'a'}); // !
  storeWithSchemas.setPartialValues({v2: 1}); // !

  storeWithSchemas.setValue('v1', 1);
  storeWithSchemas.setValue('v1', (value) => (value ?? 0) + 1);
  storeWithSchemas.setValue('v1', 'a'); // !
  storeWithSchemas.setValue('v1', () => 'a'); // !
  storeWithSchemas.setValue('v2', 1); // !

  storeWithSchemas.delValue('v1');
  storeWithSchemas.delValue('v2'); // !
})();

// Iterators
(() => {
  storeWithSchemas.forEachTable((tableId, forEachRow) => {
    tableId == 't1';
    tableId == 't2'; // !
    if (tableId == 't1') {
      forEachRow((rowId, forEachCell) => {
        rowId as string;
        forEachCell((cellId, cell) => {
          if (cellId == 'c1') {
            cell as number;
            cell as string; // !
            cell as undefined; // !
          }
          if (cellId == 'c1d') {
            cell as string;
            cell as number; // !
            cell as undefined; // !
          }
          cellId == 'c2'; // !
        });
        forEachCell((cellId) => {
          cellId == 'c1';
          cellId == 'c1d';
          cellId == 'c2'; // !
        });
        forEachCell(() => null);
      });
      forEachRow((rowId, ..._) => {
        rowId as string;
      });
      forEachRow(() => null);
    }
  });
  storeWithSchemas.forEachTable((tableId) => {
    tableId == 't1';
    tableId == 't2'; // !
  });
  storeWithSchemas.forEachTable(() => null);

  storeWithSchemas.forEachTableCell('t1', (cellId) => {
    cellId == 'c1';
    cellId == 'c1d';
    cellId == 'c2'; // !
  });
  storeWithSchemas.forEachTableCell('t2', () => null); // !

  storeWithSchemas.forEachRow('t1', (rowId, forEachCell) => {
    rowId as string;
    forEachCell((cellId, cell) => {
      if (cellId == 'c1') {
        cell as number;
        cell as string; // !
        cell as undefined; // !
      }
      if (cellId == 'c1d') {
        cell as string;
        cell as number; // !
        cell as undefined; // !
      }
      cellId == 'c2'; // !
    });
    forEachCell((cellId) => {
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c2'; // !
    });
    forEachCell(() => null);
  });
  storeWithSchemas.forEachRow('t0', (rowId, forEachCell) => {
    rowId as string;
    forEachCell((cellId, cell) => {
      if (cellId == 'c0') {
        cell as number;
        cell as string; // !
        cell as undefined; // !
      }
      cellId == 'c2'; // !
    });
    forEachCell((cellId) => {
      cellId == 'c0';
      cellId == 'c2'; // !
    });
    forEachCell(() => null);
  });
  storeWithSchemas.forEachRow('t1', (rowId, ..._) => {
    rowId as string;
  });
  storeWithSchemas.forEachRow('t1', () => null);
  storeWithSchemas.forEachRow('t2', () => null); // !

  storeWithSchemas.forEachCell('t1', 'r1', (cellId, cell) => {
    if (cellId == 'c1') {
      cell as number;
      cell as undefined; // !
      cell as string; // !
    }
    if (cellId == 'c1d') {
      cell as string;
      cell as number; // !
      cell as undefined; // !
    }
    cellId == 'c2'; // !
  });
  storeWithSchemas.forEachCell('t1', 'r1', (cellId) => {
    cellId == 'c1';
    cellId == 'c1d';
    cellId == 'c2'; // !
  });
  storeWithSchemas.forEachCell('t0', 'r0', (cellId, cell) => {
    if (cellId == 'c0') {
      cell as number;
      cell as undefined; // !
      cell as string; // !
    }
    cellId == 'c2'; // !
  });
  storeWithSchemas.forEachCell('t1', 'r1', (cellId) => {
    cellId == 'c1';
    cellId == 'c1d';
    cellId == 'c2'; // !
  });
  storeWithSchemas.forEachCell('t1', 'r1', () => null);
  storeWithSchemas.forEachCell('t2', 'r2', () => null); // !

  storeWithSchemas.forEachValue((valueId, value) => {
    if (valueId == 'v1') {
      value as number;
      value as string; // !
      value as undefined; // !
    }
    if (valueId == 'v1d') {
      value as string;
      value as number; // !
      value as undefined; // !
    }
    valueId == 'v2'; // !
  });
  storeWithSchemas.forEachValue((valueId) => {
    valueId == 'v1';
    valueId == 'v2'; // !
  });
  storeWithSchemas.forEachValue(() => null);
  storeWithSchemasOneValue.forEachValue((valueId, value) => {
    if (valueId == 'v1') {
      value as number;
      value as string; // !
      value as undefined; // !
    }
    valueId == 'v2'; // !
  });
  storeWithSchemasOneValue.forEachValue((valueId) => {
    valueId == 'v1';
    valueId == 'v2'; // !
  });
  storeWithSchemasOneValue.forEachValue(() => null);

  // Transactions

  storeWithSchemas.transaction(
    () => null,
    (store) => {
      const [cellChanges, valueChanges] = store.getTransactionChanges();
      const {changedCells, changedValues} = store.getTransactionLog();
      cellChanges.t1?.r1?.c1 as number;
      cellChanges.t1?.r1?.c1 as undefined;
      cellChanges.t1?.r1?.c1 as string; // !
      cellChanges.t1?.r1?.c2; // !
      cellChanges.t2?.r1?.c1; // !

      valueChanges.v1 as number;
      valueChanges.v1 as undefined;
      valueChanges.v1 as string; // !
      valueChanges.v2; // !

      changedCells.t1?.r1?.c1 as [number, number];
      changedCells.t1?.r1?.c1 as [number, undefined];
      changedCells.t1?.r1?.c1 as [undefined, number];
      changedCells.t1?.r1?.c1d as [string, string];
      changedCells.t1?.r1?.c1 as [string, string]; // !
      changedCells.t1?.r1?.c1d as [number, number]; // !

      changedValues.v1 as [number, number];
      changedValues.v1 as [number, undefined];
      changedValues.v1 as [undefined, number];
      changedValues.v1d as [string, string];
      changedValues.v1d as [string, undefined]; // !
      changedValues.v1d as [undefined, string]; // !
      changedValues.v1d as [undefined, undefined]; // !
      changedValues.v1 as [string, string]; // !
      changedValues.v1d as [number, number]; // !
      return true;
    },
  );

  storeWithSchemas.startTransaction().finishTransaction((store) => {
    const [cellChanges, valueChanges] = store.getTransactionChanges();
    const {changedCells, changedValues} = store.getTransactionLog();
    cellChanges.t1?.r1?.c1 as number;
    cellChanges.t1?.r1?.c1 as undefined;
    cellChanges.t1?.r1?.c1 as string; // !
    cellChanges.t1?.r1?.c2; // !
    cellChanges.t2?.r1?.c1; // !

    valueChanges.v1 as number;
    valueChanges.v1 as undefined;
    valueChanges.v1 as string; // !
    valueChanges.v2; // !

    changedCells.t1?.r1?.c1 as [number, number];
    changedCells.t1?.r1?.c1 as [number, undefined];
    changedCells.t1?.r1?.c1 as [undefined, number];
    changedCells.t1?.r1?.c1d as [string, string];
    changedCells.t1?.r1?.c1d as [string, undefined];
    changedCells.t1?.r1?.c1d as [undefined, string];
    changedCells.t1?.r1?.c1d as [undefined, undefined];
    changedCells.t1?.r1?.c1 as [string, string]; // !
    changedCells.t1?.r1?.c1d as [number, number]; // !

    changedValues.v1 as [number, number];
    changedValues.v1 as [number, undefined];
    changedValues.v1 as [undefined, number];
    changedValues.v1d as [string, string];
    changedValues.v1d as [string, undefined]; // !
    changedValues.v1d as [undefined, string]; // !
    changedValues.v1d as [undefined, undefined]; // !
    changedValues.v1 as [string, string]; // !
    changedValues.v1d as [number, number]; // !
    return true;
  });
})();

// Listeners
(() => {
  storeWithSchemas.addHasTablesListener((store, hasTables) => {
    store.getTables().t1;
    hasTables as boolean;
    hasTables as string; // !
    store.getTables().t2; // !
  });
  storeWithSchemas.addHasTablesListener((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addHasTablesListener(() => null);

  storeWithSchemas.addTablesListener((store, getCellChange) => {
    store.getTables().t1;
    getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
    store.getTables().t2; // !
    getCellChange?.('t1', 'r1', 'c1') as [true, number, string]; // !
    getCellChange?.('t1', 'r1', 'c1') as [true, string, number]; // !
  });
  storeWithSchemas.addTablesListener((store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addTablesListener(() => null);

  storeWithSchemas.addTableIdsListener((store, getIdChanges) => {
    store.getTables().t1;
    store.getTables().t2; // !

    const idChanges = getIdChanges?.() ?? {};
    idChanges.t1 == 1;
    idChanges.t2 == 1; // !
  });
  storeWithSchemas.addTableIdsListener(() => null);

  storeWithSchemas.addHasTableListener('t1', (store, tableId, hasTable) => {
    store.getTables().t1;
    tableId == 't1';
    hasTable as boolean;
    hasTable as string; // !
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addHasTableListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addHasTableListener(null, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addHasTableListener('t2', () => null); // !

  storeWithSchemas.addTableListener('t1', (store, tableId, getCellChange) => {
    store.getTables().t1;
    tableId == 't1';
    getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addTableListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addTableListener(null, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addTableListener('t2', () => null); // !

  storeWithSchemas.addTableCellIdsListener(
    't1',
    (store, tableId, getIdChanges) => {
      store.getTables().t1;
      tableId == 't1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !

      const idChanges = getIdChanges?.() ?? {};
      idChanges.c1 == 1;
      idChanges.c2 == 1; // !
    },
  );
  storeWithSchemas.addTableCellIdsListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addTableCellIdsListener('t1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addTableCellIdsListener('t1', () => null);
  storeWithSchemas.addTableCellIdsListener('t2', () => null); // !

  storeWithSchemas.addHasTableCellListener(
    't1',
    'c1',
    (store, tableId, cellId, hasTableCell) => {
      store.getTables().t1;
      tableId == 't1';
      cellId == 'c1';
      hasTableCell as boolean;
      hasTableCell as string; // !
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      cellId == 'c1d'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasTableCellListener(
    't1',
    null,
    (store, tableId, cellId, hasTableCell) => {
      store.getTables().t1;
      tableId == 't1';
      cellId == 'c1';
      cellId == 'c1d';
      hasTableCell as boolean;
      hasTableCell as string; // !
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasTableCellListener(
    null,
    'c1',
    (store, tableId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      cellId == 'c1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      cellId == 'c1d'; // !
      cellId == 'c0'; // !
      tableId == 't2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasTableCellListener(
    null,
    null,
    (store, tableId, cellId, hasTableCell) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c0';
      hasTableCell as boolean;
      hasTableCell as string; // !
      if (tableId == 't1') {
        cellId == 'c1';
        cellId == 'c1d';
        cellId == 'c0'; // !
      }
      store.getTables().t2; // !
      tableId == 't2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasTableCellListener(
    't1',
    'c1',
    (store, tableId, rowId, ..._) => {
      store.getTables().t1;
      tableId == 't1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
    },
  );
  storeWithSchemas.addHasTableCellListener(
    't1',
    'c1',
    (store, tableId, ..._) => {
      store.getTables().t1;
      tableId == 't1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
    },
  );
  storeWithSchemas.addHasTableCellListener('t1', 'c1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addHasTableCellListener('t1', 'c1', () => null);
  storeWithSchemas.addHasTableCellListener('t1', 'c2', () => null); // !
  storeWithSchemas.addHasTableCellListener(null, 'c2', () => null); // !
  storeWithSchemas.addHasTableCellListener('t2', 'c1', () => null); // !

  storeWithSchemas.addRowCountListener('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addRowCountListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addRowCountListener('t1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addRowCountListener('t1', () => null);
  storeWithSchemas.addRowCountListener('t2', () => null); // !

  storeWithSchemas.addRowIdsListener('t1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addRowIdsListener(null, (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addRowIdsListener('t1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addRowIdsListener('t1', () => null);
  storeWithSchemas.addRowIdsListener('t2', () => null); // !

  storeWithSchemas.addSortedRowIdsListener(
    't1',
    'c1',
    true,
    0,
    10,
    (store, tableId) => {
      store.getTables().t1;
      tableId == 't1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
    },
  );
  storeWithSchemas.addSortedRowIdsListener(
    't1',
    'c2', // !
    true,
    0,
    10,
    (store, tableId) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      store.getTables().t2; // !
      tableId == 't2'; // !
    },
  );
  storeWithSchemas.addSortedRowIdsListener('t1', 'c1', true, 0, 10, (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addSortedRowIdsListener('t1', 'c1', true, 0, 10, () => null);
  storeWithSchemas.addSortedRowIdsListener(
    't2', // !
    undefined,
    true,
    0,
    10,
    () => null,
  );

  storeWithSchemas.addHasRowListener(
    't1',
    'r1',
    (store, tableId, rowId, hasRow) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      hasRow as boolean;
      hasRow as string; // !
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
    },
  );
  storeWithSchemas.addHasRowListener('t1', null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addHasRowListener(null, 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  storeWithSchemas.addHasRowListener(null, null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addHasRowListener('t1', 'r1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
  });
  storeWithSchemas.addHasRowListener('t1', 'r1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addHasRowListener('t2', 'r2', () => null); // !

  storeWithSchemas.addRowListener(
    't1',
    'r1',
    (store, tableId, rowId, getCellChange) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      getCellChange?.('t1', 'r1', 'c1') as [true, number, number];
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
    },
  );
  storeWithSchemas.addRowListener('t1', null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addRowListener(null, 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  storeWithSchemas.addRowListener(null, null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addRowListener('t1', 'r1', (store, tableId) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
  });
  storeWithSchemas.addRowListener('t1', 'r1', (store) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addRowListener('t2', 'r2', () => null); // !

  storeWithSchemas.addCellIdsListener(
    't1',
    'r1',
    (store, tableId, rowId, getIdChanges) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !

      const idChanges = getIdChanges?.() ?? {};
      idChanges.c1 == 1;
      idChanges.c2 == 1; // !
    },
  );
  storeWithSchemas.addCellIdsListener('t1', null, (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    rowId == 'r1';
    rowId == 'r2';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addCellIdsListener(null, 'r1', (store, tableId, rowId) => {
    store.getTables().t1;
    tableId == 't1';
    tableId == 't0';
    rowId == 'r1';
    store.getTables().t2; // !
    tableId == 't2'; // !
    rowId == 'r2'; // !
  });
  storeWithSchemas.addCellIdsListener(
    null,
    null,
    (store, tableId, rowId, getIdChanges) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      rowId == 'r1';
      rowId == 'r2';
      store.getTables().t2; // !
      tableId == 't2'; // !

      if (tableId == 't1') {
        const idChanges = getIdChanges?.() ?? {};
        idChanges.c1 == 1;
        idChanges.c2 == 1; // !
      }
    },
  );
  storeWithSchemas.addCellIdsListener('t1', 'r1', (store, tableId, ..._) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addCellIdsListener('t1', 'r1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addCellIdsListener('t1', 'r1', () => null);
  storeWithSchemas.addCellIdsListener('t2', 'r2', () => null); // !

  storeWithSchemas.addHasCellListener(
    't1',
    'r1',
    'c1',
    (store, tableId, rowId, cellId, hasCell) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      cellId == 'c1';
      hasCell as boolean;
      hasCell as string; // !
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c1d'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    't1',
    'r1',
    null,
    (store, tableId, rowId, cellId, hasCell) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      cellId == 'c1';
      cellId == 'c1d';
      hasCell as boolean;
      hasCell as string; // !
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    't1',
    null,
    'c1',
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      rowId == 'r2';
      cellId == 'c1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      cellId == 'c1d'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    't1',
    null,
    null,
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      rowId == 'r2';
      cellId == 'c1';
      cellId == 'c1d';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    null,
    'r1',
    'c1',
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      cellId == 'c1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      cellId == 'c1d'; // !
      cellId == 'c0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    null,
    'r1',
    null,
    (store, tableId, rowId, cellId, hasCell) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      rowId == 'r1';
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c0';
      hasCell as boolean;
      hasCell as string; // !
      if (tableId == 't1') {
        cellId == 'c1';
        cellId == 'c1d';
        cellId == 'c0'; // !
      }
      store.getTables().t2; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    null,
    null,
    'c1',
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      rowId == 'r2';
      cellId == 'c1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      cellId == 'c1d'; // !
      cellId == 'c0'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    null,
    null,
    null,
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      rowId == 'r1';
      rowId == 'r2';
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c0';
      if (tableId == 't1') {
        cellId == 'c1';
        cellId == 'c1d';
        cellId == 'c0'; // !
      }
      store.getTables().t2; // !
      tableId == 't2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    't1',
    'r1',
    'c1',
    (store, tableId, rowId, ..._) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
    },
  );
  storeWithSchemas.addHasCellListener(
    't1',
    'r1',
    'c1',
    (store, tableId, ..._) => {
      store.getTables().t1;
      tableId == 't1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
    },
  );
  storeWithSchemas.addHasCellListener('t1', 'r1', 'c1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addHasCellListener('t1', 'r1', 'c1', () => null);
  storeWithSchemas.addHasCellListener('t1', 'r2', 'c2', () => null); // !
  storeWithSchemas.addHasCellListener(null, 'r2', 'c2', () => null); // !
  storeWithSchemas.addHasCellListener('t2', 'r2', 'c1', () => null); // !

  storeWithSchemas.addCellListener(
    't1',
    'r1',
    'c1',
    (store, tableId, rowId, cellId, newCell, oldCell) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      cellId == 'c1';
      newCell as number;
      oldCell as number;
      newCell as string; // !
      oldCell as string; // !
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c1d'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addCellListener(
    't1',
    'r1',
    null,
    (store, tableId, rowId, cellId, newCell, oldCell) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      cellId == 'c1';
      cellId == 'c1d';
      newCell as number;
      oldCell as number;
      newCell as string;
      oldCell as string;
      if (cellId == 'c1') {
        newCell as number;
        oldCell as number;
        newCell as string; // !
        oldCell as string; // !
      }
      if (cellId == 'c1d') {
        newCell as string;
        oldCell as string;
        newCell as number; // !
        oldCell as number; // !
      }
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addCellListener(
    't1',
    null,
    'c1',
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      rowId == 'r2';
      cellId == 'c1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      cellId == 'c1d'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addCellListener(
    't1',
    null,
    null,
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      rowId == 'r2';
      cellId == 'c1';
      cellId == 'c1d';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addCellListener(
    null,
    'r1',
    'c1',
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      cellId == 'c1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      cellId == 'c1d'; // !
      cellId == 'c0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addCellListener(
    null,
    'r1',
    null,
    (store, tableId, rowId, cellId, newCell, oldCell) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      rowId == 'r1';
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c0';
      newCell as number;
      oldCell as number;
      newCell as string;
      oldCell as string;
      if (tableId == 't1') {
        cellId == 'c1';
        cellId == 'c1d';
        newCell as number;
        oldCell as number;
        newCell as string;
        oldCell as string;
        cellId == 'c0'; // !
      }
      if (tableId == 't0') {
        newCell as number;
        oldCell as number;
        newCell as string; // !
        oldCell as string; // !
      }
      if (cellId == 'c1') {
        newCell as number;
        oldCell as number;
        newCell as string; // !
        oldCell as string; // !
      }
      if (cellId == 'c1d') {
        newCell as string;
        oldCell as string;
        newCell as number; // !
        oldCell as number; // !
      }
      store.getTables().t2; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addCellListener(
    null,
    null,
    'c1',
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      rowId == 'r2';
      cellId == 'c1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      cellId == 'c1d'; // !
      cellId == 'c0'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addCellListener(
    null,
    null,
    null,
    (store, tableId, rowId, cellId) => {
      store.getTables().t1;
      tableId == 't1';
      tableId == 't0';
      rowId == 'r1';
      rowId == 'r2';
      cellId == 'c1';
      cellId == 'c1d';
      cellId == 'c0';
      if (tableId == 't1') {
        cellId == 'c1';
        cellId == 'c1d';
        cellId == 'c0'; // !
      }
      store.getTables().t2; // !
      tableId == 't2'; // !
      cellId == 'c2'; // !
    },
  );
  storeWithSchemas.addCellListener(
    't1',
    'r1',
    'c1',
    (store, tableId, rowId, ..._) => {
      store.getTables().t1;
      tableId == 't1';
      rowId == 'r1';
      store.getTables().t2; // !
      tableId == 't0'; // !
      tableId == 't2'; // !
      rowId == 'r2'; // !
    },
  );
  storeWithSchemas.addCellListener('t1', 'r1', 'c1', (store, tableId, ..._) => {
    store.getTables().t1;
    tableId == 't1';
    store.getTables().t2; // !
    tableId == 't0'; // !
    tableId == 't2'; // !
  });
  storeWithSchemas.addCellListener('t1', 'r1', 'c1', (store, ..._) => {
    store.getTables().t1;
    store.getTables().t2; // !
  });
  storeWithSchemas.addCellListener('t1', 'r1', 'c1', () => null);
  storeWithSchemas.addCellListener('t1', 'r2', 'c2', () => null); // !
  storeWithSchemas.addCellListener(null, 'r2', 'c2', () => null); // !
  storeWithSchemas.addCellListener('t2', 'r2', 'c1', () => null); // !

  storeWithSchemas.addHasValuesListener((store, hasValues) => {
    store.getValues().v1;
    hasValues as boolean;
    store.getValues().v2; // !
    hasValues as string; // !
  });
  storeWithSchemas.addHasValuesListener((store) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  storeWithSchemas.addHasValuesListener(() => null);

  storeWithSchemas.addValuesListener((store, getValueChange) => {
    store.getValues().v1;
    getValueChange?.('v1') as [true, number, number];
    store.getValues().v2; // !
    getValueChange?.('v1') as [true, number, string]; // !
    getValueChange?.('v1') as [true, string, number]; // !
  });
  storeWithSchemas.addValuesListener((store) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  storeWithSchemas.addValuesListener(() => null);

  storeWithSchemas.addValueIdsListener((store, getIdChanges) => {
    store.getValues().v1;
    store.getValues().v2; // !

    const idChanges = getIdChanges?.() ?? {};
    idChanges.v1 == 1;
    idChanges.v2 == 1; // !
  });
  storeWithSchemas.addValueIdsListener(() => null);

  storeWithSchemas.addValueListener(
    'v1',
    (store, valueId, newValue, oldValue) => {
      store.getValues().v1;
      valueId == 'v1';
      newValue as number;
      oldValue as number;
      store.getValues().v2; // !
      valueId == 'v2'; // !
      newValue as string; // !
      oldValue as string; // !
    },
  );
  storeWithSchemas.addValueListener(
    null,
    (store, valueId, newValue, oldValue) => {
      store.getValues().v1;
      valueId == 'v1';
      valueId == 'v1d';
      newValue as number;
      oldValue as number;
      newValue as string;
      oldValue as string;
      if (valueId == 'v1') {
        newValue as number;
        oldValue as number;
        newValue as string; // !
        oldValue as string; // !
      }
      if (valueId == 'v1d') {
        newValue as string;
        oldValue as string;
        newValue as number; // !
        oldValue as number; // !
      }
      store.getValues().v2; // !
      valueId == 'v2'; // !
    },
  );
  storeWithSchemas.addValueListener(null, (store, ..._) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  storeWithSchemas.addValueListener('v2', () => null); // !

  storeWithSchemas.addHasValueListener('v1', (store, valueId, hasValue) => {
    store.getValues().v1;
    valueId == 'v1';
    hasValue as boolean;
    store.getValues().v2; // !
    valueId == 'v2'; // !
    hasValue as string; // !
  });
  storeWithSchemas.addHasValueListener(null, (store, valueId, hasValue) => {
    store.getValues().v1;
    valueId == 'v1';
    valueId == 'v1d';
    hasValue as boolean;
    store.getValues().v2; // !
    valueId == 'v2'; // !
  });
  storeWithSchemas.addHasValueListener(null, (store, valueId) => {
    store.getValues().v1;
    valueId == 'v1';
    valueId == 'v1d';
    store.getValues().v2; // !
    valueId == 'v2'; // !
  });
  storeWithSchemas.addHasValueListener(null, (store) => {
    store.getValues().v1;
    store.getValues().v2; // !
  });
  storeWithSchemas.addHasValueListener('v2', () => null); // !

  storeWithSchemas.addWillFinishTransactionListener((store) => {
    const [cellChanges, valueChanges] = store.getTransactionChanges();
    const {changedCells, changedValues} = store.getTransactionLog();

    store.getTables().t1;
    store.getValues().v1;
    store.getTables().t2; // !
    store.getValues().v2; // !

    cellChanges.t1?.r1?.c1 as number;
    cellChanges.t1?.r1?.c1 as undefined;
    cellChanges.t1?.r1?.c1 as string; // !
    cellChanges.t1?.r1?.c2; // !
    cellChanges.t2?.r1?.c1; // !

    valueChanges.v1 as number;
    valueChanges.v1 as undefined;
    valueChanges.v1 as string; // !
    valueChanges.v2; // !

    changedCells.t1;
    changedValues.v1;
    changedCells.t2; // !
    changedValues.v2; // !
  });
  storeWithSchemas.addDidFinishTransactionListener((store) => {
    const [cellChanges, valueChanges] = store.getTransactionChanges();
    const {changedCells, changedValues} = store.getTransactionLog();

    store.getTables().t1;
    store.getValues().v1;
    store.getTables().t2; // !
    store.getValues().v2; // !

    cellChanges.t1?.r1?.c1 as number;
    cellChanges.t1?.r1?.c1 as undefined;
    cellChanges.t1?.r1?.c1 as string; // !
    cellChanges.t1?.r1?.c2; // !
    cellChanges.t2?.r1?.c1; // !

    valueChanges.v1 as number;
    valueChanges.v1 as undefined;
    valueChanges.v1 as string; // !
    valueChanges.v2; // !

    changedCells.t1;
    changedValues.v1;
    changedCells.t2; // !
    changedValues.v2; // !
  });
})();

// Set schemas
(() => {
  const storeWithTablesSchema1 = store.setTablesSchema(tablesSchema);
  storeWithTablesSchema1.getTables().t1;
  storeWithTablesSchema1.getValues().v1;
  storeWithTablesSchema1.getValues().v2;
  storeWithTablesSchema1.getTables().t2; // !

  const storeWithTablesSchema2 = storeWithSchemas.setTablesSchema({
    t2: {c2: {type: 'number'}},
  });
  storeWithTablesSchema2.getTables().t2;
  storeWithTablesSchema2.getValues().v1;
  storeWithTablesSchema2.getTables().t1; // !
  storeWithTablesSchema2.getValues().v2; // !

  const storeWithTablesSchema3 = storeWithSchemas.delValuesSchema();
  storeWithTablesSchema3.getTables().t1;
  storeWithTablesSchema3.getValues().v1;
  storeWithTablesSchema3.getValues().v2;
  storeWithTablesSchema3.getTables().t2; // !

  const storeWithTablesSchema4 = store.setSchema(tablesSchema);
  storeWithTablesSchema4.getTables().t1;
  storeWithTablesSchema4.getValues().v1;
  storeWithTablesSchema4.getValues().v2;
  storeWithTablesSchema4.getTables().t2; // !

  const storeWithValuesSchema1 = store.setValuesSchema(valuesSchema);
  storeWithValuesSchema1.getTables().t1;
  storeWithValuesSchema1.getValues().v1;
  storeWithValuesSchema1.getTables().t2;
  storeWithValuesSchema1.getValues().v2; // !

  const storeWithValuesSchema2 = storeWithSchemas.setValuesSchema({
    v2: {type: 'number'},
  });
  storeWithValuesSchema2.getTables().t1;
  storeWithValuesSchema2.getValues().v2;
  storeWithValuesSchema2.getTables().t2; // !
  storeWithValuesSchema2.getValues().v1; // !

  const storeWithValueSchema3 = storeWithSchemas.delTablesSchema();
  storeWithValueSchema3.getTables().t1;
  storeWithValueSchema3.getTables().t2;
  storeWithValueSchema3.getValues().v1;
  storeWithValueSchema3.getValues().v2; // !

  const storeWithNoSchemas = storeWithSchemas.delSchema();
  storeWithNoSchemas.getValues().v1;
  storeWithNoSchemas.getValues().v2;
  storeWithNoSchemas.getTables().t1;
  storeWithNoSchemas.getTables().t2;
})();

// Mergeable methods
() => {
  const mergeableContent = storeWithSchemas.getMergeableContent();
  mergeableContent[0][0].t1;
  mergeableContent[0][0].t2; // !

  mergeableContent[0][0].t1?.[0]?.r1?.[0]?.c1?.[0] as number;
  mergeableContent[0][0].t1?.[0]?.r1?.[0]?.c1?.[0] as undefined;
  mergeableContent[0][0].t1?.[0]?.r1?.[0]?.c1d?.[0] as string;
  mergeableContent[0][0].t1?.[0]?.r1?.[0]?.c1?.[0] as string; // !
  mergeableContent[0][0].t1?.[0]?.r1?.[0]?.c1d?.[0] as number; // !
  mergeableContent[0][0].t1?.[0]?.r1?.[0]?.c2?.[0] as number;

  mergeableContent[1][0].v1;
  mergeableContent[1][0].v1![0] as undefined;
  mergeableContent[1][0].v1![0] as string; // !
  mergeableContent[1][0].v2; // !
};
