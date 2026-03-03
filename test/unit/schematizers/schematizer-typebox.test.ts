import {Type} from '@sinclair/typebox';
import {createStore} from 'tinybase';
import {
  createTypeBoxSchematizer,
  type TypeBoxSchematizer,
} from 'tinybase/schematizers/schematizer-typebox';
import {beforeEach, describe, expect, test} from 'vitest';

describe('TypeBox Schematizer', () => {
  let schematizer: TypeBoxSchematizer;

  beforeEach(() => {
    schematizer = createTypeBoxSchematizer();
  });

  describe('toTablesSchema', () => {
    test('converts basic TypeBox object schema', () => {
      expect(
        schematizer.toTablesSchema({
          t1: Type.Object({
            c1: Type.String(),
            c2: Type.Number(),
            c3: Type.Boolean(),
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

    test('converts TypeBox schema with defaults', () => {
      expect(
        schematizer.toTablesSchema({
          t1: Type.Object({
            c1: Type.String(),
            c2: Type.Boolean({default: false}),
            c3: Type.Number({default: 0}),
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

    test('converts TypeBox schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: Type.Object({
            c1: Type.Union([Type.String(), Type.Null()]),
            c2: Type.Number(),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string', allowNull: true},
          c2: {type: 'number'},
        },
      });
    });

    test('converts TypeBox schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: Type.Object({
            c1: Type.String(),
            c2: Type.Optional(Type.String()),
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
          t1: Type.Object({
            c1: Type.String(),
          }),
          t2: Type.Object({
            c1: Type.String(),
            c2: Type.String(),
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

    test('ignores unsupported TypeBox types', () => {
      expect(
        schematizer.toTablesSchema({
          t1: Type.Object({
            c1: Type.String(),
            c2: Type.Date(),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
        },
      });
    });

    test('converts TypeBox object and array cells', () => {
      expect(
        schematizer.toTablesSchema({
          t1: Type.Object({
            c1: Type.String(),
            c2: Type.Array(Type.String()),
            c3: Type.Record(Type.String(), Type.String()),
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

    test('converts TypeBox object and array cell defaults', () => {
      expect(
        schematizer.toTablesSchema({
          t1: Type.Object({
            c1: Type.Array(Type.String(), {default: ['a', 'b']}),
            c2: Type.Object({k: Type.String()}, {default: {k: 'v'}}),
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
        t1: Type.Object({
          c1: Type.String(),
          c2: Type.Number(),
          c3: Type.Boolean({default: false}),
        }),
      });

      const store = createStore().setTablesSchema(tablesSchema);
      store.setRow('t1', 'r1', {c1: 'a', c2: 1});

      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 1, c3: false});
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic TypeBox schemas', () => {
      expect(
        schematizer.toValuesSchema({
          v1: Type.String(),
          v2: Type.Number(),
          v3: Type.Boolean(),
        }),
      ).toEqual({
        v1: {type: 'string'},
        v2: {type: 'number'},
        v3: {type: 'boolean'},
      });
    });

    test('converts TypeBox object and array values', () => {
      expect(
        schematizer.toValuesSchema({
          v1: Type.Record(Type.String(), Type.String()),
          v2: Type.Array(Type.String()),
        }),
      ).toEqual({
        v1: {type: 'object'},
        v2: {type: 'array'},
      });
    });

    test('converts TypeBox schemas with defaults', () => {
      expect(
        schematizer.toValuesSchema({
          v1: Type.String({default: 'a'}),
          v2: Type.Number({default: 0}),
          v3: Type.Boolean({default: true}),
        }),
      ).toEqual({
        v1: {type: 'string', default: 'a'},
        v2: {type: 'number', default: 0},
        v3: {type: 'boolean', default: true},
      });
    });

    test('works with TinyBase store', () => {
      const valuesSchema = schematizer.toValuesSchema({
        v1: Type.String({default: 'a'}),
        v2: Type.Number(),
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
