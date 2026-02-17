/* eslint-disable @typescript-eslint/no-unused-expressions */
// NB: an exclamation mark after a line visually indicates an expected TS error
import {createMiddleware, createStore} from 'tinybase/with-schemas';

const tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {c1: {type: 'number'}, c1d: {type: 'string', default: ''}},
} as const;

const valuesSchema = {
  v1: {type: 'number'},
  v1d: {type: 'string', default: ''},
} as const;

const middlewareWithNoSchema = createMiddleware(createStore());
middlewareWithNoSchema.getStore().getTables().t1;
middlewareWithNoSchema.getStore().getTables().t2;

const storeWithSchemas = createStore().setSchema(tablesSchema, valuesSchema);
const middlewareWithSchema = createMiddleware(storeWithSchemas);

middlewareWithSchema.getStore().getTables().t1;
middlewareWithSchema.getStore().getTables().t2; // !

// addWillSetCellCallback
() => {
  middlewareWithSchema.addWillSetCellCallback(
    (tableId, _rowId, cellId, cell) => {
      tableId == 't0' && cellId == 'c0';
      tableId == 't0' && cellId == 'c0' && (cell as number);
      tableId == 't1' && cellId == 'c1';

      tableId == 't0' && cellId == 'c0' && (cell as string); // !
      tableId == 't0' && cellId == 'c1'; // !
      tableId == 't2'; // !
      cellId == 'c2'; // !

      return undefined;
    },
  );

  middlewareWithSchema.addWillSetCellCallback(
    (_tableId, _rowId, _cellId, cell) => cell,
  );
  middlewareWithSchema.addWillSetCellCallback(() => undefined);
  middlewareWithSchema.addWillSetCellCallback(() => 1);
  middlewareWithSchema.addWillSetCellCallback(() => '');
  middlewareWithSchema.addWillSetCellCallback(() => false); // !

  middlewareWithSchema
    .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => cell)
    .getStore()
    .getTables().t1;
  middlewareWithSchema
    .addWillSetCellCallback((_tableId, _rowId, _cellId, cell) => cell)
    .getStore()
    .getTables().t2; // !
};

// addWillSetRowCallback
() => {
  middlewareWithSchema.addWillSetRowCallback((tableId, _rowId, row) => {
    tableId == 't0';
    tableId == 't1';

    tableId == 't2'; // !

    return row;
  });

  middlewareWithSchema.addWillSetRowCallback((_tableId, _rowId, row) => row);
  middlewareWithSchema.addWillSetRowCallback(() => undefined);

  middlewareWithSchema
    .addWillSetRowCallback((_tableId, _rowId, row) => row)
    .getStore()
    .getTables().t1;
  middlewareWithSchema
    .addWillSetRowCallback((_tableId, _rowId, row) => row)
    .getStore()
    .getTables().t2; // !
};

// addWillSetValueCallback
() => {
  middlewareWithSchema.addWillSetValueCallback((valueId, value) => {
    valueId == 'v1';
    valueId == 'v1' && (value as number);
    valueId == 'v1d';
    valueId == 'v1d' && (value as string);

    valueId == 'v1' && (value as string); // !
    valueId == 'v2'; // !

    return undefined;
  });

  middlewareWithSchema.addWillSetValueCallback((_valueId, value) => value);
  middlewareWithSchema.addWillSetValueCallback(() => undefined);
  middlewareWithSchema.addWillSetValueCallback(() => 1);
  middlewareWithSchema.addWillSetValueCallback(() => '');
  middlewareWithSchema.addWillSetValueCallback(() => false); // !

  middlewareWithSchema
    .addWillSetValueCallback((_valueId, value) => value)
    .getStore()
    .getTables().t1;
  middlewareWithSchema
    .addWillSetValueCallback((_valueId, value) => value)
    .getStore()
    .getTables().t2; // !
};

// addWillSetValuesCallback
() => {
  middlewareWithSchema.addWillSetValuesCallback((values) => {
    values.v1;
    values.v1d;

    values.v2; // !

    return values;
  });

  middlewareWithSchema.addWillSetValuesCallback((values) => values);
  middlewareWithSchema.addWillSetValuesCallback(() => undefined);

  middlewareWithSchema
    .addWillSetValuesCallback((values) => values)
    .getStore()
    .getTables().t1;
  middlewareWithSchema
    .addWillSetValuesCallback((values) => values)
    .getStore()
    .getTables().t2; // !
};

// addWillDelCellCallback
() => {
  middlewareWithSchema.addWillDelCellCallback((tableId, _rowId, cellId) => {
    tableId == 't0' && cellId == 'c0';
    tableId == 't1' && cellId == 'c1';

    tableId == 't0' && cellId == 'c1'; // !
    tableId == 't2'; // !
    cellId == 'c2'; // !

    return true;
  });

  middlewareWithSchema
    .addWillDelCellCallback(() => true)
    .getStore()
    .getTables().t1;
  middlewareWithSchema
    .addWillDelCellCallback(() => true)
    .getStore()
    .getTables().t2; // !
};

// addWillDelValueCallback
() => {
  middlewareWithSchema.addWillDelValueCallback((valueId) => {
    valueId == 'v1';
    valueId == 'v1d';

    valueId == 'v2'; // !

    return true;
  });

  middlewareWithSchema
    .addWillDelValueCallback(() => true)
    .getStore()
    .getTables().t1;
  middlewareWithSchema
    .addWillDelValueCallback(() => true)
    .getStore()
    .getTables().t2; // !
};

// destroy
middlewareWithSchema.destroy();
