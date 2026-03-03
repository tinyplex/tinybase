import {createStore} from 'tinybase';
import {
  createZodSchematizer,
  type ZodSchematizer,
} from 'tinybase/schematizers/schematizer-zod';
import {beforeEach, describe, expect, test} from 'vitest';
import {z} from 'zod';

describe('Zod Schematizer', () => {
  let schematizer: ZodSchematizer;

  beforeEach(() => {
    schematizer = createZodSchematizer();
  });

  describe('toTablesSchema', () => {
    test('converts basic Zod object schema', () => {
      expect(
        schematizer.toTablesSchema({
          t1: z.object({
            c1: z.string(),
            c2: z.number(),
            c3: z.boolean(),
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

    test('converts Zod schema with defaults', () => {
      expect(
        schematizer.toTablesSchema({
          t1: z.object({
            c1: z.string(),
            c2: z.boolean().default(false),
            c3: z.number().default(0),
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

    test('converts Zod schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: z.object({
            c1: z.string().nullable(),
            c2: z.number(),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string', allowNull: true},
          c2: {type: 'number'},
        },
      });
    });

    test('converts Zod schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: z.object({
            c1: z.string(),
            c2: z.string().optional(),
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
          t1: z.object({
            c1: z.string(),
          }),
          t2: z.object({
            c1: z.string(),
            c2: z.string(),
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

    test('ignores unsupported Zod types', () => {
      expect(
        schematizer.toTablesSchema({
          t1: z.object({
            c1: z.string(),
            c2: z.date(),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
        },
      });
    });

    test('converts Zod object and array cells', () => {
      expect(
        schematizer.toTablesSchema({
          t1: z.object({
            c1: z.string(),
            c2: z.array(z.string()),
            c3: z.record(z.string(), z.string()),
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

    test('converts Zod object and array cell defaults', () => {
      expect(
        schematizer.toTablesSchema({
          t1: z.object({
            c1: z.array(z.string()).default(['a', 'b']),
            c2: z.record(z.string(), z.string()).default({k: 'v'}),
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
        t1: z.object({
          c1: z.string(),
          c2: z.number(),
          c3: z.boolean().default(false),
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
    test('converts basic Zod schemas', () => {
      expect(
        schematizer.toValuesSchema({
          v1: z.string(),
          v2: z.number(),
          v3: z.boolean(),
        }),
      ).toEqual({
        v1: {type: 'string'},
        v2: {type: 'number'},
        v3: {type: 'boolean'},
      });
    });

    test('converts Zod object and array values', () => {
      expect(
        schematizer.toValuesSchema({
          v1: z.record(z.string(), z.string()),
          v2: z.array(z.string()),
        }),
      ).toEqual({
        v1: {type: 'object'},
        v2: {type: 'array'},
      });
    });

    test('converts Zod schemas with defaults', () => {
      expect(
        schematizer.toValuesSchema({
          v1: z.string().default('a'),
          v2: z.number().default(0),
          v3: z.boolean().default(true),
        }),
      ).toEqual({
        v1: {type: 'string', default: 'a'},
        v2: {type: 'number', default: 0},
        v3: {type: 'boolean', default: true},
      });
    });

    test('works with TinyBase store', () => {
      const valuesSchema = schematizer.toValuesSchema({
        v1: z.string().default('a'),
        v2: z.number(),
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
