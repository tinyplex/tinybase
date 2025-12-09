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
          pets: v.object({
            species: v.string(),
            age: v.number(),
            sold: v.boolean(),
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

    test('converts Valibot schema with fallbacks', () => {
      expect(
        schematizer.toTablesSchema({
          pets: v.object({
            species: v.string(),
            sold: v.fallback(v.boolean(), false),
            price: v.fallback(v.number(), 0),
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

    test('converts Valibot schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: v.object({
            species: v.nullable(v.string()),
            age: v.number(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string', allowNull: true},
          age: {type: 'number'},
        },
      });
    });

    test('converts Valibot schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: v.object({
            species: v.string(),
            nickname: v.optional(v.string()),
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
          pets: v.object({
            species: v.string(),
          }),
          stores: v.object({
            name: v.string(),
            city: v.string(),
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

    test('ignores unsupported Valibot types', () => {
      expect(
        schematizer.toTablesSchema({
          pets: v.object({
            species: v.string(),
            tags: v.array(v.string()),
            metadata: v.record(v.string(), v.string()),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
        },
      });
    });

    test('works with TinyBase store', () => {
      const valibotSchemas = {
        pets: v.object({
          species: v.string(),
          age: v.number(),
          sold: v.fallback(v.boolean(), false),
        }),
      };

      const tablesSchema = schematizer.toTablesSchema(valibotSchemas);
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
    test('converts basic Valibot schemas', () => {
      expect(
        schematizer.toValuesSchema({
          theme: v.string(),
          count: v.number(),
          isOpen: v.boolean(),
        }),
      ).toEqual({
        theme: {type: 'string'},
        count: {type: 'number'},
        isOpen: {type: 'boolean'},
      });
    });

    test('converts Valibot schemas with fallbacks', () => {
      expect(
        schematizer.toValuesSchema({
          theme: v.fallback(v.string(), 'light'),
          count: v.fallback(v.number(), 0),
          isOpen: v.fallback(v.boolean(), true),
        }),
      ).toEqual({
        theme: {type: 'string', default: 'light'},
        count: {type: 'number', default: 0},
        isOpen: {type: 'boolean', default: true},
      });
    });

    test('works with TinyBase store', () => {
      const valibotSchemas = {
        theme: v.fallback(v.string(), 'light'),
        count: v.number(),
      };

      const valuesSchema = schematizer.toValuesSchema(valibotSchemas);
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
