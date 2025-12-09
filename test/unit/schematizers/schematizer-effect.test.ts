import * as S from 'effect/Schema';
import {createStore} from 'tinybase';
import {
  type EffectSchematizer,
  createEffectSchematizer,
} from 'tinybase/schematizers/schematizer-effect';
import {beforeEach, describe, expect, test} from 'vitest';

describe('Effect Schematizer', () => {
  let schematizer: EffectSchematizer;

  beforeEach(() => {
    schematizer = createEffectSchematizer();
  });

  describe('toTablesSchema', () => {
    test('converts basic Effect object schema', () => {
      expect(
        schematizer.toTablesSchema({
          pets: S.Struct({
            species: S.String,
            age: S.Number,
            sold: S.Boolean,
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

    test('converts Effect schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: S.Struct({
            species: S.NullOr(S.String),
            age: S.Number,
          }),
        }),
      ).toEqual({
        pets: {
          species: {type: 'string', allowNull: true},
          age: {type: 'number'},
        },
      });
    });

    test('converts Effect schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          pets: S.Struct({
            species: S.String,
            nickname: S.optional(S.String),
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
          pets: S.Struct({
            species: S.String,
          }),
          owners: S.Struct({
            name: S.String,
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

    test('ignores unsupported Effect types', () => {
      expect(
        schematizer.toTablesSchema({
          pets: S.Struct({
            species: S.String,
            data: S.Array(S.String),
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
          pets: S.Struct({
            species: S.String,
            age: S.Number,
          }),
        }),
      );

      store.setRow('pets', 'fido', {species: 'dog', age: 3});

      expect(store.getRow('pets', 'fido')).toEqual({
        species: 'dog',
        age: 3,
      });
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic Effect schemas', () => {
      expect(
        schematizer.toValuesSchema({
          open: S.Boolean,
          employees: S.Number,
        }),
      ).toEqual({
        open: {type: 'boolean'},
        employees: {type: 'number'},
      });
    });

    test('converts Effect schemas with nullable', () => {
      expect(
        schematizer.toValuesSchema({
          open: S.Boolean,
          manager: S.NullOr(S.String),
        }),
      ).toEqual({
        open: {type: 'boolean'},
        manager: {type: 'string', allowNull: true},
      });
    });

    test('works with TinyBase store', () => {
      const store = createStore().setValuesSchema(
        schematizer.toValuesSchema({
          open: S.Boolean,
          employees: S.Number,
        }),
      );

      store.setValues({open: true, employees: 5});

      expect(store.getValues()).toEqual({open: true, employees: 5});
    });
  });
});
