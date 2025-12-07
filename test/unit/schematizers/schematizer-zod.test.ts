import {createStore} from 'tinybase';
import {createZodSchematizer} from 'tinybase/schematizers/schematizer-zod';
import {beforeEach, describe, expect, test} from 'vitest';
import {z} from 'zod';

describe('Zod Schematizer', () => {
  let schematizer: ReturnType<typeof createZodSchematizer>;

  beforeEach(() => {
    schematizer = createZodSchematizer();
  });

  describe('toTablesSchema', () => {
    test('converts basic Zod object schema', () => {
      expect(
        schematizer.toTablesSchema({
          pets: z.object({
            species: z.string(),
            age: z.number(),
            sold: z.boolean(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
          age: {type: 'number'},
          sold: {type: 'boolean'},
        },
      });
    });

    test('converts Zod schema with defaults', () => {
      expect(
        schematizer.toTablesSchema({
          pets: z.object({
            species: z.string(),
            sold: z.boolean().default(false),
            price: z.number().default(0),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
          sold: {type: 'boolean', default: false},
          price: {type: 'number', default: 0},
        },
      });
    });

    test('converts Zod schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: z.object({
            species: z.string().nullable(),
            age: z.number(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string', allowNull: true},
          age: {type: 'number'},
        },
      });
    });

    test('converts Zod schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: z.object({
            species: z.string(),
            nickname: z.string().optional(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
          nickname: {type: 'string'},
        },
      });
    });

    test('converts multiple tables', () => {
      expect(
        schematizer.toTablesSchema({
          pets: z.object({
            species: z.string(),
          }),
          stores: z.object({
            name: z.string(),
            city: z.string(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
        },
        stores: {
          name: {type: 'string'},
          city: {type: 'string'},
        },
      });
    });

    test('ignores unsupported Zod types', () => {
      expect(
        schematizer.toTablesSchema({
          pets: z.object({
            species: z.string(),
            tags: z.array(z.string()), // unsupported
            metadata: z.record(z.string(), z.string()), // unsupported
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
        },
      });
    });

    test('works with TinyBase store', () => {
      const zodSchemas = {
        pets: z.object({
          species: z.string(),
          age: z.number(),
          sold: z.boolean().default(false),
        }),
      };

      const tablesSchema = schematizer.toTablesSchema(zodSchemas);
      const store = createStore().setTablesSchema(tablesSchema);

      expect(store.getTablesSchemaJson()).toEqual(
        JSON.stringify({
          pets: {
            species: {type: 'string'},
            age: {type: 'number'},
            sold: {type: 'boolean', default: false},
          },
        }),
      );

      store.setRow('pets', 'fido', {species: 'dog', age: 3});
      expect(store.getRow('pets', 'fido')).toEqual({
        species: 'dog',
        age: 3,
        sold: false,
      });
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic Zod schemas', () => {
      expect(
        schematizer.toValuesSchema({
          theme: z.string(),
          count: z.number(),
          isOpen: z.boolean(),
        }),
      ).toEqual({
        theme: {type: 'string'},
        count: {type: 'number'},
        isOpen: {type: 'boolean'},
      });
    });

    test('converts Zod schemas with defaults', () => {
      expect(
        schematizer.toValuesSchema({
          theme: z.string().default('light'),
          count: z.number().default(0),
          isOpen: z.boolean().default(true),
        }),
      ).toEqual({
        theme: {type: 'string', default: 'light'},
        count: {type: 'number', default: 0},
        isOpen: {type: 'boolean', default: true},
      });
    });

    test('works with TinyBase store', () => {
      const zodSchemas = {
        theme: z.string().default('light'),
        count: z.number(),
      };

      const valuesSchema = schematizer.toValuesSchema(zodSchemas);
      const store = createStore().setValuesSchema(valuesSchema);

      expect(store.getValuesSchemaJson()).toEqual(
        JSON.stringify({
          theme: {type: 'string', default: 'light'},
          count: {type: 'number'},
        }),
      );

      store.setValue('count', 42);
      expect(store.getValues()).toEqual({
        theme: 'light',
        count: 42,
      });
    });
  });
});
