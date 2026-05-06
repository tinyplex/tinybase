import type {createYupSchematizer as createYupSchematizerDecl} from '../../@types/schematizers/schematizer-yup/index.d.ts';
import {arrayEvery} from '../../common/array.ts';
import {isString, size} from '../../common/other.ts';
import {DEFAULT, NULLABLE, STRING, TYPE} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const MIXED = 'mixed';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  const oneOf = schema?._whitelist
    ? Array.from(schema._whitelist as Set<any>)
    : [];

  return [
    {
      [TYPE]:
        schema?.type === MIXED && size(oneOf) > 0 && arrayEvery(oneOf, isString)
          ? STRING
          : schema?.type,
    },
    defaultValue ?? schema?.spec?.[DEFAULT],
    allowNull || schema?.spec?.[NULLABLE] || false,
  ];
};

const getProperties = (schema: any) => schema?.fields;

export const createYupSchematizer: typeof createYupSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
