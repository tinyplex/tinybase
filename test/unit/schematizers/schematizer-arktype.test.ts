import {type} from 'arktype';
import {createStore} from 'tinybase';
import {
  type ArkTypeSchematizer,
  createArkTypeSchematizer,
} from 'tinybase/schematizers/schematizer-arktype';
import {beforeEach, describe, expect, test} from 'vitest';

describe('ArkType Schematizer', () => {
  let schematizer: ArkTypeSchematizer;

  beforeEach(() => {
    schematizer = createArkTypeSchematizer();
  });

  describe('toTablesSchema', () => {
    test('converts basic ArkType object schema', () => {
      expect(
        schematizer.toTablesSchema({
          t1: type({
            c1: 'string',
            c2: 'number',
            c3: 'boolean',
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
          c2: {type: 'number'},
          c3: {type: 'boolean'},
        },
      });
    });

    test('converts ArkType schema with defaults', () => {
      expect(
        schematizer.toTablesSchema({
          t1: type({
            c1: 'string',
            c2: type('boolean').default(false),
            c3: type('number').default(0),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
          c2: {type: 'boolean', default: false},
          c3: {type: 'number', default: 0},
        },
      });
    });

    test('converts ArkType schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: type({
            c1: 'string | null',
            c2: 'number',
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string', allowNull: true},
          c2: {type: 'number'},
        },
      });
    });

    test('converts ArkType schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: type({
            c1: 'string',
            c2: 'string?',
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
          c2: {type: 'string'},
        },
      });
    });

    test('converts multiple tables', () => {
      expect(
        schematizer.toTablesSchema({
          t1: type({
            c1: 'string',
          }),
          t2: type({
            c1: 'string',
            c2: 'string',
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
        },
        t2: {
          c1: {type: 'string'},
          c2: {type: 'string'},
        },
      });
    });

    test('ignores unsupported ArkType types', () => {
      expect(
        schematizer.toTablesSchema({
          t1: type({
            c1: 'string',
            c2: 'bigint',
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
        },
      });
    });

    test('converts ArkType object and array cells', () => {
      expect(
        schematizer.toTablesSchema({
          t1: type({
            c1: 'string',
            c2: 'string[]',
            c3: 'object',
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
          c2: {type: 'array'},
          c3: {type: 'object'},
        },
      });
    });

    test('works with TinyBase store', () => {
      const tablesSchema = schematizer.toTablesSchema({
        t1: type({
          c1: 'string',
          c2: 'number',
          c3: type('boolean').default(false),
        }),
      });
      const store = createStore().setTablesSchema(tablesSchema);

      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        t1: {
          c1: {type: 'string'},
          c2: {type: 'number'},
          c3: {type: 'boolean', default: false},
        },
      });

      store.setRow('t1', 'r1', {c1: 'a', c2: 1});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 1, c3: false});
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic ArkType schemas', () => {
      expect(
        schematizer.toValuesSchema({
          v1: 'string',
          v2: 'number',
          v3: 'boolean',
        }),
      ).toEqual({
        v1: {type: 'string'},
        v2: {type: 'number'},
        v3: {type: 'boolean'},
      });
    });

    test('converts ArkType object and array values', () => {
      expect(
        schematizer.toValuesSchema({
          v1: 'object',
          v2: type('string[]'),
        }),
      ).toEqual({
        v1: {type: 'object'},
        v2: {type: 'array'},
      });
    });

    test('converts ArkType schemas with defaults', () => {
      expect(
        schematizer.toValuesSchema({
          v1: type('string').default('a'),
          v2: type('number').default(0),
          v3: type('boolean').default(true),
        }),
      ).toEqual({
        v1: {type: 'string', default: 'a'},
        v2: {type: 'number', default: 0},
        v3: {type: 'boolean', default: true},
      });
    });

    test('works with TinyBase store', () => {
      const valuesSchema = schematizer.toValuesSchema({
        v1: type('string').default('a'),
        v2: 'number',
      });
      const store = createStore().setValuesSchema(valuesSchema);

      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({
        v1: {type: 'string', default: 'a'},
        v2: {type: 'number'},
      });

      store.setValue('v2', 1);
      expect(store.getValues()).toEqual({v1: 'a', v2: 1});
    });
  });
});
