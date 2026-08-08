import {describe, expect, test} from 'vitest';

import {createCustomSchematizer} from 'tinybase/schematizers';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = true,
): [any, any, boolean, boolean] => [
  schema,
  defaultValue ?? schema.default,
  allowNull ?? schema.allowNull ?? false,
  schema.required ?? required,
];

const getProperties = (schema: any) => schema.properties;

describe('Custom Schematizer', () => {
  const schematizer = createCustomSchematizer(unwrapSchema, getProperties);

  test('converts enum table schemas', () => {
    expect(
      schematizer.toTablesSchema({
        pets: {
          properties: {
            status: {enum: ['draft', 'live'], default: 'draft'},
            rating: {enum: [1, 2, true]},
            name: {enum: ['fido'], allowNull: true},
          },
        },
      }),
    ).toEqual({
      pets: {
        status: {enum: ['draft', 'live'], default: 'draft'},
        rating: {enum: [1, 2, true], required: true},
        name: {enum: ['fido'], allowNull: true, required: true},
      },
    });
  });

  test('converts enum value schemas', () => {
    expect(
      schematizer.toValuesSchema({
        status: {enum: ['draft', 'live'], required: false},
        rating: {enum: [1, 2, true]},
        name: {type: 'string'},
      }),
    ).toEqual({
      status: {enum: ['draft', 'live']},
      rating: {enum: [1, 2, true], required: true},
      name: {type: 'string', required: true},
    });
  });

  test('filters invalid enum schemas', () => {
    expect(
      schematizer.toValuesSchema({
        empty: {enum: []},
        nullable: {enum: [null]},
        object: {enum: [{}]},
        array: {enum: [[]]},
        infinite: {enum: [Infinity]},
        reserved: {enum: ['\uFFFC']},
        both: {type: 'string', enum: ['draft']},
      }),
    ).toEqual({});
  });
});
