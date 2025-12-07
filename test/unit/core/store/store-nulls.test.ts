import type {Store} from 'tinybase';
import {createStore} from 'tinybase';
import {beforeEach, describe, expect, test} from 'vitest';

describe('Null values', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  test('Setting and getting null', () => {
    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);
    expect(store.hasCell('t1', 'r1', 'c1')).toEqual(true);
  });

  test('Null vs undefined', () => {
    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);
    expect(store.hasCell('t1', 'r1', 'c1')).toEqual(true);

    store.delCell('t1', 'r1', 'c1');
    expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
    expect(store.hasCell('t1', 'r1', 'c1')).toEqual(false);
  });

  test('Setting null value', () => {
    store.setValue('v1', null);
    expect(store.getValue('v1')).toEqual(null);
    expect(store.hasValue('v1')).toEqual(true);
  });

  test('Null value vs undefined', () => {
    store.setValue('v1', null);
    expect(store.getValue('v1')).toEqual(null);
    expect(store.hasValue('v1')).toEqual(true);

    store.delValue('v1');
    expect(store.getValue('v1')).toBeUndefined();
    expect(store.hasValue('v1')).toEqual(false);
  });

  test('Type changes with null', () => {
    store.setCell('t1', 'r1', 'c1', '1');
    expect(store.getCell('t1', 'r1', 'c1')).toEqual('1');

    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);

    store.setCell('t1', 'r1', 'c1', 2);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(2);
  });

  test('Null in table data', () => {
    store.setTables({
      t1: {
        r1: {c1: '1', c2: null, c3: 3},
        r2: {c1: null},
      },
    });

    expect(store.getCell('t1', 'r1', 'c1')).toEqual('1');
    expect(store.getCell('t1', 'r1', 'c2')).toEqual(null);
    expect(store.getCell('t1', 'r1', 'c3')).toEqual(3);
    expect(store.getCell('t1', 'r2', 'c1')).toEqual(null);
  });

  test('Null in values data', () => {
    store.setValues({v1: '1', v2: null, v3: 3});

    expect(store.getValue('v1')).toEqual('1');
    expect(store.getValue('v2')).toEqual(null);
    expect(store.getValue('v3')).toEqual(3);
  });

  test('JSON serialization with null', () => {
    store.setCell('t1', 'r1', 'c1', null);
    store.setValue('v1', null);

    const json = store.getJson();
    expect(json).toEqual('[{"t1":{"r1":{"c1":null}}},{"v1":null}]');

    const newStore = createStore();
    newStore.setJson(json);

    expect(newStore.getCell('t1', 'r1', 'c1')).toEqual(null);
    expect(newStore.getValue('v1')).toEqual(null);
  });

  test('JSON round-trip with mixed types including null', () => {
    store.setTables({
      t1: {
        r1: {c1: '1', c2: 2, c3: null},
        r2: {c1: '2', c2: null, c3: false},
      },
    });
    store.setValues({
      v1: null,
      v2: 3,
      v3: true,
    });

    const json = store.getJson();
    const store2 = createStore();
    store2.setJson(json);

    expect(store2.getTables()).toEqual(store.getTables());
    expect(store2.getValues()).toEqual(store.getValues());
    expect(store2.getCell('t1', 'r1', 'c3')).toEqual(null);
    expect(store2.getCell('t1', 'r2', 'c2')).toEqual(null);
    expect(store2.getValue('v1')).toEqual(null);
  });
});

describe('Null with schemas', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  test('Schema with allowNull: true', () => {
    store.setTablesSchema({
      t1: {
        c1: {type: 'string', allowNull: true},
      },
    });

    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);

    store.setCell('t1', 'r1', 'c1', 'hello');
    expect(store.getCell('t1', 'r1', 'c1')).toEqual('hello');
  });

  test('Schema with allowNull: false (default)', () => {
    store.setTablesSchema({
      t1: {
        c1: {type: 'string'},
      },
    });

    store.setCell('t1', 'r1', 'c1', null);
    expect(store.hasCell('t1', 'r1', 'c1')).toEqual(false);
  });

  test('Schema with default: null', () => {
    store.setTablesSchema({
      t1: {
        c1: {type: 'string', default: null, allowNull: true},
      },
    });

    store.setRow('t1', 'r1', {});
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);
  });

  test('Schema with default: null requires allowNull: true', () => {
    const result = store.setTablesSchema({
      t1: {
        c1: {type: 'string', default: null},
      },
    });

    expect(result).toEqual(store);
    expect(store.getTablesSchemaJson()).toEqual('{}');
  });

  test('Values schema with allowNull: true', () => {
    store.setValuesSchema({
      v1: {type: 'number', allowNull: true},
    });

    store.setValue('v1', null);
    expect(store.getValue('v1')).toEqual(null);

    store.setValue('v1', 42);
    expect(store.getValue('v1')).toEqual(42);
  });

  test('Values schema with allowNull: false (default)', () => {
    store.setValuesSchema({
      v1: {type: 'number'},
    });

    store.setValue('v1', null);
    expect(store.hasValue('v1')).toEqual(false);
  });

  test('Multiple types with different null settings', () => {
    store.setTablesSchema({
      t1: {
        c1: {type: 'string'},
        c2: {type: 'number', allowNull: true},
        c3: {type: 'boolean', default: true},
      },
    });

    store.setRow('t1', 'r1', {
      c1: '1',
      c2: null,
      c3: true,
    });

    expect(store.getCell('t1', 'r1', 'c1')).toEqual('1');
    expect(store.getCell('t1', 'r1', 'c2')).toEqual(null);
    expect(store.getCell('t1', 'r1', 'c3')).toEqual(true);

    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual('1');
  });
});

describe('Null listeners and events', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  test('Cell listener fires when setting to null', () => {
    expect.assertions(2);
    store.addCellListener(
      't1',
      'r1',
      'c1',
      (_store, _table, _row, _cell, newCell, oldCell) => {
        expect(newCell).toEqual(null);
        expect(oldCell).toBeUndefined();
      },
    );

    store.setCell('t1', 'r1', 'c1', null);
  });

  test('Cell listener fires when changing from null', () => {
    store.setCell('t1', 'r1', 'c1', null);
    expect.assertions(2);
    store.addCellListener(
      't1',
      'r1',
      'c1',
      (_store, _table, _row, _cell, newCell, oldCell) => {
        expect(newCell).toEqual('1');
        expect(oldCell).toEqual(null);
      },
    );

    store.setCell('t1', 'r1', 'c1', '1');
  });

  test('Value listener fires when setting to null', () => {
    expect.assertions(2);
    store.addValueListener('v1', (_store, _valueId, newValue, oldValue) => {
      expect(newValue).toEqual(null);
      expect(oldValue).toBeUndefined();
    });

    store.setValue('v1', null);
  });

  test('HasCell listener distinguishes null from deleted', () => {
    expect.assertions(2);
    let callCount = 0;
    store.addHasCellListener(
      't1',
      'r1',
      'c1',
      (_store, _table, _row, _cell, hasCell) => {
        if (callCount === 0) {
          expect(hasCell).toEqual(true);
        } else if (callCount === 1) {
          expect(hasCell).toEqual(false);
        }
        callCount++;
      },
    );

    store.setCell('t1', 'r1', 'c1', null);
    store.delCell('t1', 'r1', 'c1');
  });
});

describe('Null vs Delete semantics', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  test('setCell(null) creates a cell, delCell removes it', () => {
    store.setCell('t1', 'r1', 'c1', null);
    expect(store.hasCell('t1', 'r1', 'c1')).toEqual(true);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);
    expect(store.getCellIds('t1', 'r1')).toEqual(['c1']);

    store.delCell('t1', 'r1', 'c1');
    expect(store.hasCell('t1', 'r1', 'c1')).toEqual(false);
    expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
    expect(store.getCellIds('t1', 'r1')).toEqual([]);
  });

  test('setValue(null) creates a value, delValue removes it', () => {
    store.setValue('v1', null);
    expect(store.hasValue('v1')).toEqual(true);
    expect(store.getValue('v1')).toEqual(null);
    expect(store.getValueIds()).toEqual(['v1']);

    store.delValue('v1');
    expect(store.hasValue('v1')).toEqual(false);
    expect(store.getValue('v1')).toBeUndefined();
    expect(store.getValueIds()).toEqual([]);
  });

  test('Null cells appear in iteration', () => {
    store.setTables({
      t1: {
        r1: {c1: '1', c2: null, c3: 3},
      },
    });

    const cells: [string, any][] = [];
    store.forEachCell('t1', 'r1', (cellId, cell) => {
      cells.push([cellId, cell]);
    });

    expect(cells).toEqual([
      ['c1', '1'],
      ['c2', null],
      ['c3', 3],
    ]);
  });

  test('Null values appear in iteration', () => {
    store.setValues({v1: '1', v2: null, v3: 3});

    const values: [string, any][] = [];
    store.forEachValue((valueId, value) => {
      values.push([valueId, value]);
    });

    expect(values).toEqual([
      ['v1', '1'],
      ['v2', null],
      ['v3', 3],
    ]);
  });
});

describe('Transactions with null', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  test('Transaction can handle null values', () => {
    store.setCell('t1', 'r1', 'c1', 'initial');

    store.startTransaction();
    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);
    store.finishTransaction();

    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);
  });

  test('Transaction can commit null values', () => {
    store.transaction(() => {
      store.setCell('t1', 'r1', 'c1', null);
      store.setValue('v1', null);
    });

    expect(store.getCell('t1', 'r1', 'c1')).toEqual(null);
    expect(store.getValue('v1')).toEqual(null);
  });
});
