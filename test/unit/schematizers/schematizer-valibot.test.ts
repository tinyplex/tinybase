import {createStore} from 'tinybase';
import {
  createValibotSchematizer,
  type ValibotSchematizer,
} from 'tinybase/schematizers/schematizer-valibot';
import * as v from 'valibot';
import {beforeEach, describe, expect, test} from 'vitest';

describe('Valibot Schematizer', () => {
  let schematizer: ValibotSchematizer;

  beforeEach(() => {
    schematizer = createValibotSchematizer();
  });

  describe('toTablesSchema', () => {
    test('converts basic Valibot object schema', () => {
      expect(
        schematizer.toTablesSchema({
          t1: v.object({
            c1: v.string(),
            c2: v.number(),
            c3: v.boolean(),
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

    test('converts Valibot schema with fallbacks', () => {
      expect(
        schematizer.toTablesSchema({
          t1: v.object({
            c1: v.string(),
            c2: v.fallback(v.boolean(), false),
            c3: v.fallback(v.number(), 0),
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

    test('converts Valibot schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: v.object({
            c1: v.nullable(v.string()),
            c2: v.number(),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string', allowNull: true},
          c2: {type: 'number'},
        },
      });
    });

    test('converts Valibot schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: v.object({
            c1: v.string(),
            c2: v.optional(v.string()),
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
          t1: v.object({
            c1: v.string(),
          }),
          t2: v.object({
            c1: v.string(),
            c2: v.string(),
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

    test('ignores unsupported Valibot types', () => {
      expect(
        schematizer.toTablesSchema({
          t1: v.object({
            c1: v.string(),
            c2: v.tuple([v.number(), v.number()]),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
        },
      });
    });

    test('converts Valibot object and array cells', () => {
      expect(
        schematizer.toTablesSchema({
          t1: v.object({
            c1: v.string(),
            c2: v.array(v.string()),
            c3: v.record(v.string(), v.string()),
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

    test('converts Valibot object and array cell defaults', () => {
      expect(
        schematizer.toTablesSchema({
          t1: v.object({
            c1: v.fallback(v.array(v.string()), ['a', 'b']),
            c2: v.fallback(v.record(v.string(), v.string()), {k: 'v'}),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'array', default: ['a', 'b']},
          c2: {type: 'object', default: {k: 'v'}},
        },
      });
    });

    test('works with TinyBase store', () => {
      const tablesSchema = schematizer.toTablesSchema({
        t1: v.object({
          c1: v.string(),
          c2: v.number(),
          c3: v.fallback(v.boolean(), false),
        }),
      });
      const store = createStore().setTablesSchema(tablesSchema);

      expect(store.getTablesSchemaJson()).toEqual(
        JSON.stringify({
          t1: {
            c1: {type: 'string'},
            c2: {type: 'number'},
            c3: {type: 'boolean', default: false},
          },
        }),
      );

      store.setRow('t1', 'r1', {c1: 'a', c2: 1});
      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 1, c3: false});
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic Valibot schemas', () => {
      expect(
        schematizer.toValuesSchema({
          v1: v.string(),
          v2: v.number(),
          v3: v.boolean(),
        }),
      ).toEqual({
        v1: {type: 'string'},
        v2: {type: 'number'},
        v3: {type: 'boolean'},
      });
    });

    test('converts Valibot object and array values', () => {
      expect(
        schematizer.toValuesSchema({
          v1: v.record(v.string(), v.string()),
          v2: v.array(v.string()),
        }),
      ).toEqual({
        v1: {type: 'object'},
        v2: {type: 'array'},
      });
    });

    test('converts Valibot schemas with fallbacks', () => {
      expect(
        schematizer.toValuesSchema({
          v1: v.fallback(v.string(), 'a'),
          v2: v.fallback(v.number(), 0),
          v3: v.fallback(v.boolean(), true),
        }),
      ).toEqual({
        v1: {type: 'string', default: 'a'},
        v2: {type: 'number', default: 0},
        v3: {type: 'boolean', default: true},
      });
    });

    test('works with TinyBase store', () => {
      const valuesSchema = schematizer.toValuesSchema({
        v1: v.fallback(v.string(), 'a'),
        v2: v.number(),
      });
      const store = createStore().setValuesSchema(valuesSchema);

      expect(store.getValuesSchemaJson()).toEqual(
        JSON.stringify({
          v1: {type: 'string', default: 'a'},
          v2: {type: 'number'},
        }),
      );

      store.setValue('v2', 1);
      expect(store.getValues()).toEqual({v1: 'a', v2: 1});
    });
  });
});
