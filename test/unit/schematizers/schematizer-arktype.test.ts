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
          pets: type({
            species: 'string',
            age: 'number',
            sold: 'boolean',
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

    test('converts ArkType schema with defaults', () => {
      expect(
        schematizer.toTablesSchema({
          pets: type({
            species: 'string',
            sold: type('boolean').default(false),
            price: type('number').default(0),
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

    test('converts ArkType schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: type({
            species: 'string | null',
            age: 'number',
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string', allowNull: true},
          age: {type: 'number'},
        },
      });
    });

    test('converts ArkType schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: type({
            species: 'string',
            nickname: 'string?',
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
          pets: type({
            species: 'string',
          }),
          stores: type({
            name: 'string',
            city: 'string',
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

    test('ignores unsupported ArkType types', () => {
      expect(
        schematizer.toTablesSchema({
          pets: type({
            species: 'string',
            tags: 'string[]',
            metadata: 'Record<string, string>',
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
        },
      });
    });

    test('works with TinyBase store', () => {
      const arkTypeSchemas = {
        pets: type({
          species: 'string',
          age: 'number',
          sold: type('boolean').default(false),
        }),
      };

      const tablesSchema = schematizer.toTablesSchema(arkTypeSchemas);
      const store = createStore().setTablesSchema(tablesSchema);

      expect(JSON.parse(store.getTablesSchemaJson())).toEqual({
        pets: {
          species: {type: 'string'},
          age: {type: 'number'},
          sold: {type: 'boolean', default: false},
        },
      });

      store.setRow('pets', 'fido', {species: 'dog', age: 3});
      expect(store.getRow('pets', 'fido')).toEqual({
        species: 'dog',
        age: 3,
        sold: false,
      });
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic ArkType schemas', () => {
      expect(
        schematizer.toValuesSchema({
          theme: 'string',
          count: 'number',
          isOpen: 'boolean',
        }),
      ).toEqual({
        theme: {type: 'string'},
        count: {type: 'number'},
        isOpen: {type: 'boolean'},
      });
    });

    test('converts ArkType schemas with defaults', () => {
      expect(
        schematizer.toValuesSchema({
          theme: type('string').default('light'),
          count: type('number').default(0),
          isOpen: type('boolean').default(true),
        }),
      ).toEqual({
        theme: {type: 'string', default: 'light'},
        count: {type: 'number', default: 0},
        isOpen: {type: 'boolean', default: true},
      });
    });

    test('works with TinyBase store', () => {
      const arkTypeSchemas = {
        theme: type('string').default('light'),
        count: 'number',
      };

      const valuesSchema = schematizer.toValuesSchema(arkTypeSchemas);
      const store = createStore().setValuesSchema(valuesSchema);

      expect(JSON.parse(store.getValuesSchemaJson())).toEqual({
        theme: {type: 'string', default: 'light'},
        count: {type: 'number'},
      });

      store.setValue('count', 42);
      expect(store.getValues()).toEqual({
        theme: 'light',
        count: 42,
      });
    });
  });
});
