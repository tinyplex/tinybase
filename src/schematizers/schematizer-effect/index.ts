import type {createEffectSchematizer as createEffectSchematizerDecl} from '../../@types/schematizers/schematizer-effect/index.d.ts';
import {arrayFind} from '../../common/array.ts';
import {isNull} from '../../common/other.ts';
import {
  BOOLEAN,
  BOOLEAN_KEYWORD,
  EMPTY_STRING,
  LITERAL,
  NUMBER,
  NUMBER_KEYWORD,
  PROPERTY_SIGNATURES,
  STRING,
  STRING_KEYWORD,
  TYPE,
  TYPE_LITERAL,
  UNION,
} from '../../common/strings.ts';
import {createCustomSchematizer} from '../index.ts';

type TypeNode = any;

const unwrapSchema = (
  schema: TypeNode,
  defaultValue?: any,
  allowNull?: boolean,
): [any, any, boolean] => {
  const ast = schema.ast || schema;
  const type = ast._tag;
  if (type === UNION) {
    const types = ast.types;
    return [
      {[TYPE]: getSimpleType(types[0]._tag)},
      defaultValue,
      allowNull ||
        !!arrayFind(
          types,
          (t: TypeNode) => t._tag === LITERAL && isNull(t.literal),
        ),
    ];
  }

  return [{[TYPE]: getSimpleType(type)}, defaultValue, allowNull || false];
};

const getSimpleType = (tag: string): string =>
  tag === STRING_KEYWORD
    ? STRING
    : tag === NUMBER_KEYWORD
      ? NUMBER
      : tag === BOOLEAN_KEYWORD
        ? BOOLEAN
        : EMPTY_STRING;

const getProperties = (schema: any) => {
  const ast = schema.ast;
  if (ast._tag === TYPE_LITERAL) {
    const signatures = ast[PROPERTY_SIGNATURES];
    if (signatures) {
      const properties: any = {};
      signatures.forEach((sig: any) => {
        properties[sig.name] = sig.type;
      });
      return properties;
    }
  }
};

export const createEffectSchematizer: typeof createEffectSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
