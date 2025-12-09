import type {createYupSchematizer as createYupSchematizerDecl} from '../../@types/schematizers/schematizer-yup/index.d.ts';
import {DEFAULT, NULLABLE, TYPE} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

const unwrapSchema = (
  schema: any,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => [
  {[TYPE]: schema?.type},
  defaultValue ?? schema?.spec?.[DEFAULT],
  allowNull || schema?.spec?.[NULLABLE] || false,
];

const getProperties = (schema: any) => schema?.fields;

export const createYupSchematizer: typeof createYupSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
