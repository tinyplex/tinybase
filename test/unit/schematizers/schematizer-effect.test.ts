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
          t1: S.Struct({
            c1: S.String,
            c2: S.Number,
            c3: S.Boolean,
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

    test('converts Effect schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: S.Struct({
            c1: S.NullOr(S.String),
            c2: S.Number,
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string', allowNull: true},
          c2: {type: 'number'},
        },
      });
    });

    test('converts Effect schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: S.Struct({
            c1: S.String,
            c2: S.optional(S.String),
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
          t1: S.Struct({
            c1: S.String,
          }),
          t2: S.Struct({
            c1: S.String,
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
        },
        t2: {
          c1: {type: 'string'},
        },
      });
    });

    test('ignores unsupported Effect types', () => {
      expect(
        schematizer.toTablesSchema({
          t1: S.Struct({
            c1: S.String,
            c2: S.DateFromSelf,
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
        },
      });
    });

    test('converts Effect object and array cells', () => {
      expect(
        schematizer.toTablesSchema({
          t1: S.Struct({
            c1: S.String,
            c2: S.Array(S.String),
            c3: S.Struct({k: S.String}),
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
      const store = createStore().setTablesSchema(
        schematizer.toTablesSchema({
          t1: S.Struct({
            c1: S.String,
            c2: S.Number,
          }),
        }),
      );

      store.setRow('t1', 'r1', {c1: 'a', c2: 1});

      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 1});
    });
  });

  describe('toValuesSchema', () => {
    test('converts Effect object and array values', () => {
      expect(
        schematizer.toValuesSchema({
          v1: S.Record({key: S.String, value: S.String}),
          v2: S.Array(S.String),
        }),
      ).toEqual({
        v1: {type: 'object'},
        v2: {type: 'array'},
      });
    });

    test('converts basic Effect schemas', () => {
      expect(
        schematizer.toValuesSchema({
          v1: S.Boolean,
          v2: S.Number,
        }),
      ).toEqual({
        v1: {type: 'boolean'},
        v2: {type: 'number'},
      });
    });

    test('converts Effect schemas with nullable', () => {
      expect(
        schematizer.toValuesSchema({
          v1: S.Boolean,
          v2: S.NullOr(S.String),
        }),
      ).toEqual({
        v1: {type: 'boolean'},
        v2: {type: 'string', allowNull: true},
      });
    });

    test('works with TinyBase store', () => {
      const store = createStore().setValuesSchema(
        schematizer.toValuesSchema({
          v1: S.Boolean,
          v2: S.Number,
        }),
      );

      store.setValues({v1: true, v2: 1});

      expect(store.getValues()).toEqual({v1: true, v2: 1});
    });
  });
});
