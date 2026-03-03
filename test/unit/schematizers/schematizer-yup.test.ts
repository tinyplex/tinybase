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
          t1: yup.object({
            c1: yup.string(),
            c2: yup.number(),
            c3: yup.boolean(),
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

    test('converts Yup schema with defaults', () => {
      expect(
        schematizer.toTablesSchema({
          t1: yup.object({
            c1: yup.string(),
            c2: yup.boolean().default(false),
            c3: yup.number().default(0),
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

    test('converts Yup schema with nullable fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: yup.object({
            c1: yup.string().nullable(),
            c2: yup.number(),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string', allowNull: true},
          c2: {type: 'number'},
        },
      });
    });

    test('converts Yup schema with optional fields', () => {
      expect(
        schematizer.toTablesSchema({
          t1: yup.object({
            c1: yup.string(),
            c2: yup.string().optional(),
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
          t1: yup.object({
            c1: yup.string(),
          }),
          t2: yup.object({
            c1: yup.string(),
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

    test('ignores unsupported Yup types', () => {
      expect(
        schematizer.toTablesSchema({
          t1: yup.object({
            c1: yup.string(),
            c2: yup.date(),
          }),
        }),
      ).toEqual({
        t1: {
          c1: {type: 'string'},
        },
      });
    });

    test('converts Yup object and array cells', () => {
      expect(
        schematizer.toTablesSchema({
          t1: yup.object({
            c1: yup.string(),
            c2: yup.array(),
            c3: yup.object(),
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
          t1: yup.object({
            c1: yup.string(),
            c2: yup.number().default(0),
          }),
        }),
      );

      store.setRow('t1', 'r1', {c1: 'a'});

      expect(store.getRow('t1', 'r1')).toEqual({c1: 'a', c2: 0});
    });
  });

  describe('toValuesSchema', () => {
    test('converts basic Yup schemas', () => {
      expect(
        schematizer.toValuesSchema({
          v1: yup.boolean(),
          v2: yup.number(),
        }),
      ).toEqual({
        v1: {type: 'boolean'},
        v2: {type: 'number'},
      });
    });

    test('converts Yup object and array values', () => {
      expect(
        schematizer.toValuesSchema({
          v1: yup.object(),
          v2: yup.array(),
        }),
      ).toEqual({
        v1: {type: 'object'},
        v2: {type: 'array'},
      });
    });

    test('converts Yup schemas with defaults', () => {
      expect(
        schematizer.toValuesSchema({
          v1: yup.boolean().default(true),
          v2: yup.number().default(0),
        }),
      ).toEqual({
        v1: {type: 'boolean', default: true},
        v2: {type: 'number', default: 0},
      });
    });

    test('works with TinyBase store', () => {
      const store = createStore().setValuesSchema(
        schematizer.toValuesSchema({
          v1: yup.boolean().default(true),
        }),
      );

      expect(store.getValues()).toEqual({v1: true});
    });
  });
});
