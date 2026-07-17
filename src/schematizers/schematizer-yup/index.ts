import type {createYupSchematizer as createYupSchematizerDecl} from '../../@types/schematizers/schematizer-yup/index.d.ts';
import {arrayEvery} from '../../common/array.ts';
import {collValues} from '../../common/coll.ts';
import {isEmpty, isString} from '../../common/other.ts';
import {
  DEFAULT,
  NULLABLE,
  OPTIONAL,
  STRING,
  TYPE,
} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const MIXED = 'mixed';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = schema?.spec?.[OPTIONAL] === false,
): [any, any, boolean, boolean] => {
  const oneOf = collValues(schema?._whitelist as Set<any> | undefined);

  return [
    {
      [TYPE]:
        schema?.type === MIXED && !isEmpty(oneOf) && arrayEvery(oneOf, isString)
          ? STRING
          : schema?.type,
    },
    defaultValue ?? schema?.spec?.[DEFAULT],
    allowNull || schema?.spec?.[NULLABLE] || false,
    required,
  ];
};

const getProperties = (schema: any) => schema?.fields;

export const createYupSchematizer: typeof createYupSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
