/* eslint-disable @typescript-eslint/no-non-null-assertion */

// NB: an exclamation mark after a line visually indicates an expected TS error

import {createStore} from 'tinybase/debug/with-schemas';
import tsc from 'typescript';

const tablesSchema = {
  t1: {c1: {type: 'number'}, c1d: {type: 'string', default: ''}},
} as const;

const valuesSchema = {
  v1: {type: 'number'},
  v1d: {type: 'string', default: ''},
} as const;

const store = createStore();

const storeWithSchemas = store.setSchema(tablesSchema, valuesSchema);
storeWithSchemas.setTables({t1: {r1: {c1: 1}}});

// Getters

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

storeWithSchemas.getRowIds('t1');
storeWithSchemas.getRowIds('t2'); // !

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
storeWithSchemas.getCell('t1', 'r1', 'c1d') as undefined; // !
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

// Setters & deleters

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

// Iterators

storeWithSchemas.forEachTable((tableId, forEachRow) => {
  tableId == 't1';
  tableId == 't2'; // !
  forEachRow((_rowId, forEachCell) => {
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
  });
});

storeWithSchemas.forEachRow('t1', (_rowId, forEachCell) => {
  forEachCell((cellId, cell) => {
    if (cellId == 'c1') {
      cell;
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
});
storeWithSchemas.forEachRow('t2', () => null); // !

storeWithSchemas.forEachCell('t1', 'r1', (cellId, cell) => {
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
  valueId == 'c2'; // !
});

// Transactions

storeWithSchemas.transaction(
  () => null,
  (changedCells, _invalidCells, changedValues, _invalidValues) => {
    changedCells.t1?.r1?.c1 as [number, number];
    changedCells.t1?.r1?.c1 as [number, undefined];
    changedCells.t1?.r1?.c1 as [undefined, number];
    changedCells.t1?.r1?.c1d as [string, string];
    changedCells.t1?.r1?.c1d as [string, undefined]; // !
    changedCells.t1?.r1?.c1d as [undefined, string]; // !
    changedCells.t1?.r1?.c1d as [undefined, undefined]; // !
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

storeWithSchemas
  .startTransaction()
  .finishTransaction(
    (changedCells, _invalidCells, changedValues, _invalidValues) => {
      changedCells.t1?.r1?.c1 as [number, number];
      changedCells.t1?.r1?.c1 as [number, undefined];
      changedCells.t1?.r1?.c1 as [undefined, number];
      changedCells.t1?.r1?.c1d as [string, string];
      changedCells.t1?.r1?.c1d as [string, undefined]; // !
      changedCells.t1?.r1?.c1d as [undefined, string]; // !
      changedCells.t1?.r1?.c1d as [undefined, undefined]; // !
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

//--

test('Types with schemas', () => {
  const {options} = tsc.parseJsonSourceFileConfigFileContent(
    tsc.readJsonConfigFile('test/tsconfig.json', tsc.sys.readFile),
    tsc.sys,
    'test',
  );
  const results = tsc.getPreEmitDiagnostics(
    tsc.createProgram([__filename], options),
  );
  results.map((result) => {
    const {file, messageText, start} = result;
    const {line, character} = file?.getLineAndCharacterOfPosition(
      start ?? 0,
    ) ?? {line: 0, character: 0};
    expect([
      `${line}:${character}`,
      typeof messageText == 'string' ? messageText : messageText.messageText,
    ]).toMatchSnapshot();
  });
});
