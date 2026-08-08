import type {createYupSchematizer as createYupSchematizerDecl} from '../../@types/schematizers/schematizer-yup/index.d.ts';
import {arrayFilter, arrayFind} from '../../common/array.ts';
import {collValues} from '../../common/coll.ts';
import {isEmpty, isNull, isUndefined} from '../../common/other.ts';
import {DEFAULT, ENUM, NULLABLE, OPTIONAL, TYPE} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
  required = schema?.spec?.[OPTIONAL] === false,
): [any, any, boolean, boolean] => {
  const oneOf = collValues(schema?._whitelist as Set<any> | undefined);
  const enumValues = arrayFilter(oneOf, (value) => !isNull(value));
  const hasNull = !isUndefined(arrayFind(oneOf, isNull));

  return [
    !isEmpty(enumValues) ? {[ENUM]: enumValues} : {[TYPE]: schema?.type},
    defaultValue ?? schema?.spec?.[DEFAULT],
    allowNull || schema?.spec?.[NULLABLE] || hasNull || false,
    required,
  ];
};

const getProperties = (schema: any) => schema?.fields;

export const createYupSchematizer: typeof createYupSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
