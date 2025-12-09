import {createStore} from 'tinybase';
import {
  type YupSchematizer,
  createYupSchematizer,
} from 'tinybase/schematizers/schematizer-yup';
import {beforeEach, describe, expect, test} from 'vitest';
import * as yup from 'yup';

describe('Yup Schematizer', () => {
  let schematizer: YupSchematizer;

  beforeEach(() => {
    schematizer = createYupSchematizer();
  });

  describe('toTablesSchema', () => {
    test('converts basic Yup object schema', () => {
      expect(
        schematizer.toTablesSchema({
          pets: yup.object({
            species: yup.string(),
            age: yup.number(),
            sold: yup.boolean(),
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

    test('converts Yup schema with defaults', () => {
      expect(
        schematizer.toTablesSchema({
          pets: yup.object({
            species: yup.string(),
            sold: yup.boolean().default(false),
            price: yup.number().default(0),
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

    test('converts Yup schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: yup.object({
            species: yup.string().nullable(),
            age: yup.number(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string', allowNull: true},
          age: {type: 'number'},
        },
      });
    });

    test('converts Yup schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: yup.object({
            species: yup.string(),
            nickname: yup.string().optional(),
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
          pets: yup.object({
            species: yup.string(),
          }),
          owners: yup.object({
            name: yup.string(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
        },
        owners: {
          name: {type: 'string'},
        },
      });
    });

    test('ignores unsupported Yup types', () => {
      expect(
        schematizer.toTablesSchema({
          pets: yup.object({
            species: yup.string(),
            data: yup.array(),
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string'},
        },
      });
    });

    test('works with TinyBase store', () => {
      const store = createStore().setTablesSchema(
        schematizer.toTablesSchema({
          pets: yup.object({
            species: yup.string(),
            price: yup.number().default(5),
          }),
        }),
      );

      store.setRow('pets', 'fido', {species: 'dog'});

      expect(store.getRow('pets', 'fido')).toEqual({
        species: 'dog',
        price: 5,
      });
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic Yup schemas', () => {
      expect(
        schematizer.toValuesSchema({
          open: yup.boolean(),
          employees: yup.number(),
        }),
      ).toEqual({
        open: {type: 'boolean'},
        employees: {type: 'number'},
      });
    });

    test('converts Yup schemas with defaults', () => {
      expect(
        schematizer.toValuesSchema({
          open: yup.boolean().default(true),
          employees: yup.number().default(3),
        }),
      ).toEqual({
        open: {type: 'boolean', default: true},
        employees: {type: 'number', default: 3},
      });
    });

    test('works with TinyBase store', () => {
      const store = createStore().setValuesSchema(
        schematizer.toValuesSchema({
          open: yup.boolean().default(true),
        }),
      );

      expect(store.getValues()).toEqual({open: true});
    });
  });
});
