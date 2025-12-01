import {beforeEach, describe, expect, test} from 'vitest';
import type {Store} from 'tinybase';
import {createStore} from 'tinybase';

describe('Null values', () => {
  let store: Store;

  beforeEach(() => {
    store = createStore();
  });

  test('Setting and getting null', () => {
    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toBe(null);
    expect(store.hasCell('t1', 'r1', 'c1')).toBe(true); // Cell EXISTS
  });

  test('Null vs undefined', () => {
    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toBe(null);
    expect(store.hasCell('t1', 'r1', 'c1')).toBe(true);

    store.delCell('t1', 'r1', 'c1');
    expect(store.getCell('t1', 'r1', 'c1')).toBeUndefined();
    expect(store.hasCell('t1', 'r1', 'c1')).toBe(false); // Doesn't exist
  });

  test('Setting null value', () => {
    store.setValue('v1', null);
    expect(store.getValue('v1')).toBe(null);
    expect(store.hasValue('v1')).toBe(true);
  });

  test('Null value vs undefined', () => {
    store.setValue('v1', null);
    expect(store.getValue('v1')).toBe(null);
    expect(store.hasValue('v1')).toBe(true);

    store.delValue('v1');
    expect(store.getValue('v1')).toBeUndefined();
    expect(store.hasValue('v1')).toBe(false);
  });

  test('Type changes with null', () => {
    store.setCell('t1', 'r1', 'c1', 'hello');
    expect(store.getCell('t1', 'r1', 'c1')).toBe('hello');

    store.setCell('t1', 'r1', 'c1', null);
    expect(store.getCell('t1', 'r1', 'c1')).toBe(null);

    store.setCell('t1', 'r1', 'c1', 123);
    expect(store.getCell('t1', 'r1', 'c1')).toBe(123);
  });

  test('Null in table data', () => {
    store.setTables({
      t1: {
        r1: {c1: 'hello', c2: null, c3: 42},
        r2: {c1: null},
      },
    });

    expect(store.getCell('t1', 'r1', 'c1')).toBe('hello');
    expect(store.getCell('t1', 'r1', 'c2')).toBe(null);
    expect(store.getCell('t1', 'r1', 'c3')).toBe(42);
    expect(store.getCell('t1', 'r2', 'c1')).toBe(null);
  });

  test('Null in values data', () => {
    store.setValues({v1: 'test', v2: null, v3: 100});

    expect(store.getValue('v1')).toBe('test');
    expect(store.getValue('v2')).toBe(null);
    expect(store.getValue('v3')).toBe(100);
  });

  test('JSON serialization with null', () => {
    store.setCell('t1', 'r1', 'c1', null);
    store.setValue('v1', null);

    const json = store.getJson();
    expect(json).toBe('[{"t1":{"r1":{"c1":null}}},{"v1":null}]');

    const newStore = createStore();
    newStore.setJson(json);

    expect(newStore.getCell('t1', 'r1', 'c1')).toBe(null);
    expect(newStore.getValue('v1')).toBe(null);
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

    store.setCell('t1', 'r1', 'c1', null); // ✓ Allowed
    expect(store.getCell('t1', 'r1', 'c1')).toBe(null);

    store.setCell('t1', 'r1', 'c1', 'hello'); // ✓ Also allowed
    expect(store.getCell('t1', 'r1', 'c1')).toBe('hello');
  });

  test('Schema with allowNull: false (default)', () => {
    store.setTablesSchema({
      t1: {
        c1: {type: 'string'}, // allowNull defaults to false
      },
    });

    store.setCell('t1', 'r1', 'c1', null); // ✗ Rejected
    expect(store.hasCell('t1', 'r1', 'c1')).toBe(false);
  });

  test('Schema with default: null', () => {
    store.setTablesSchema({
      t1: {
        c1: {type: 'string', default: null, allowNull: true},
      },
    });

    store.setRow('t1', 'r1', {}); // c1 gets default null
    expect(store.getCell('t1', 'r1', 'c1')).toBe(null);
  });

  test('Schema with default: null requires allowNull: true', () => {
    // This should fail schema validation
    const result = store.setTablesSchema({
      t1: {
        c1: {type: 'string', default: null}, // Missing allowNull: true
      },
    });

    // Schema validation should fail
    expect(result).toBe(store);
    // The schema should not be set
    expect(store.getTablesSchemaJson()).toBe('{}');
  });

  test('Values schema with allowNull: true', () => {
    store.setValuesSchema({
      v1: {type: 'number', allowNull: true},
    });

    store.setValue('v1', null); // ✓ Allowed
    expect(store.getValue('v1')).toBe(null);

    store.setValue('v1', 42); // ✓ Also allowed
    expect(store.getValue('v1')).toBe(42);
  });

  test('Values schema with allowNull: false (default)', () => {
    store.setValuesSchema({
      v1: {type: 'number'}, // allowNull defaults to false
    });

    store.setValue('v1', null); // ✗ Rejected
    expect(store.hasValue('v1')).toBe(false);
  });

  test('Multiple types with different null settings', () => {
    store.setTablesSchema({
      t1: {
        name: {type: 'string'}, // null not allowed
        age: {type: 'number', allowNull: true}, // null allowed
        active: {type: 'boolean', default: true}, // null not allowed
      },
    });

    store.setRow('t1', 'r1', {
      name: 'Alice',
      age: null, // ✓
      active: true,
    });

    expect(store.getCell('t1', 'r1', 'name')).toBe('Alice');
    expect(store.getCell('t1', 'r1', 'age')).toBe(null);
    expect(store.getCell('t1', 'r1', 'active')).toBe(true);

    // Try to set null on non-nullable field
    store.setCell('t1', 'r1', 'name', null); // ✗ Rejected
    expect(store.getCell('t1', 'r1', 'name')).toBe('Alice'); // Unchanged
  });
});
