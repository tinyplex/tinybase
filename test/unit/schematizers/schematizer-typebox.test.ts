import {Type} from '@sinclair/typebox';
import {createStore} from 'tinybase';
import {createTypeBoxSchematizer} from 'tinybase/schematizers/schematizer-typebox';
import {beforeEach, describe, expect, test} from 'vitest';

describe('TypeBox Schematizer', () => {
  let schematizer: ReturnType<typeof createTypeBoxSchematizer>;

  beforeEach(() => {
    schematizer = createTypeBoxSchematizer();
  });

  describe('toTablesSchema', () => {
    test('converts basic TypeBox object schema', () => {
      expect(
        schematizer.toTablesSchema({
          pets: Type.Object({
            species: Type.String(),
            age: Type.Number(),
            sold: Type.Boolean(),
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

    test('converts TypeBox schema with defaults', () => {
      expect(
        schematizer.toTablesSchema({
          pets: Type.Object({
            species: Type.String(),
            sold: Type.Boolean({default: false}),
            price: Type.Number({default: 0}),
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

    test('converts TypeBox schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: Type.Object({
            species: Type.Union([Type.String(), Type.Null()]),
            age: Type.Number(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string', allowNull: true},
          age: {type: 'number'},
        },
      });
    });

    test('converts TypeBox schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: Type.Object({
            species: Type.String(),
            nickname: Type.Optional(Type.String()),
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
          pets: Type.Object({
            species: Type.String(),
          }),
          stores: Type.Object({
            name: Type.String(),
            city: Type.String(),
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

    test('ignores unsupported TypeBox types', () => {
      expect(
        schematizer.toTablesSchema({
          pets: Type.Object({
            species: Type.String(),
            tags: Type.Array(Type.String()),
            metadata: Type.Record(Type.String(), Type.String()),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
        },
      });
    });

    test('works with TinyBase store', () => {
      const tablesSchema = schematizer.toTablesSchema({
        pets: Type.Object({
          species: Type.String(),
          age: Type.Number(),
          sold: Type.Boolean({default: false}),
        }),
      });

      const store = createStore().setTablesSchema(tablesSchema);
      store.setRow('pets', 'fido', {species: 'dog', age: 3});

      expect(store.getRow('pets', 'fido')).toEqual({
        species: 'dog',
        age: 3,
        sold: false,
      });
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic TypeBox schemas', () => {
      expect(
        schematizer.toValuesSchema({
          theme: Type.String(),
          count: Type.Number(),
          isOpen: Type.Boolean(),
        }),
      ).toEqual({
        theme: {type: 'string'},
        count: {type: 'number'},
        isOpen: {type: 'boolean'},
      });
    });

    test('converts TypeBox schemas with defaults', () => {
      expect(
        schematizer.toValuesSchema({
          theme: Type.String({default: 'light'}),
          count: Type.Number({default: 0}),
          isOpen: Type.Boolean({default: true}),
        }),
      ).toEqual({
        theme: {type: 'string', default: 'light'},
        count: {type: 'number', default: 0},
        isOpen: {type: 'boolean', default: true},
      });
    });

    test('works with TinyBase store', () => {
      const valuesSchema = schematizer.toValuesSchema({
        theme: Type.String({default: 'light'}),
        count: Type.Number(),
      });

      const store = createStore().setValuesSchema(valuesSchema);

      expect(store.getValuesSchemaJson()).toEqual(
        JSON.stringify({
          theme: {type: 'string', default: 'light'},
          count: {type: 'number'},
        }),
      );

      store.setValue('count', 42);
      expect(store.getValues()).toEqual({theme: 'light', count: 42});
    });
  });
});
