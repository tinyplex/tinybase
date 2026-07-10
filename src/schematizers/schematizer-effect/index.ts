import type {createEffectSchematizer as createEffectSchematizerDecl} from '../../@types/schematizers/schematizer-effect/index.d.ts';
import {arrayFind} from '../../common/array.ts';
import {isNull} from '../../common/other.ts';
import {
  ARRAY,
  BOOLEAN,
  BOOLEAN_KEYWORD,
  EMPTY_STRING,
  LITERAL,
  NUMBER,
  NUMBER_KEYWORD,
  OBJECT,
  PROPERTY_SIGNATURES,
  STRING,
  STRING_KEYWORD,
  TUPLE_TYPE,
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
  required = true,
): [any, any, boolean, boolean] => {
  const ast = schema.ast || schema;
  const typeAst = ast.type || ast;
  required = required && !ast.isOptional;
  const type = typeAst._tag;
  if (type === UNION) {
    const types = typeAst.types;
    const nonNullType = arrayFind(
      types,
      (t: TypeNode) => !(t._tag === LITERAL && isNull(t.literal)),
    );
    return [
      {[TYPE]: getSimpleType(nonNullType)},
      defaultValue,
      allowNull ||
        !!arrayFind(
          types,
          (t: TypeNode) => t._tag === LITERAL && isNull(t.literal),
        ),
      required,
    ];
  }

  return [
    {[TYPE]: getSimpleType(typeAst)},
    defaultValue,
    allowNull || false,
    required,
  ];
};

const getSimpleType = (ast: TypeNode): string => {
  const tag = ast?._tag;
  const literalType = typeof ast?.literal;

  return tag === LITERAL
    ? literalType === STRING ||
      literalType === NUMBER ||
      literalType === BOOLEAN
      ? literalType
      : EMPTY_STRING
    : tag === STRING_KEYWORD
      ? STRING
      : tag === NUMBER_KEYWORD
        ? NUMBER
        : tag === BOOLEAN_KEYWORD
          ? BOOLEAN
          : tag === TUPLE_TYPE
            ? ARRAY
            : tag === TYPE_LITERAL
              ? OBJECT
              : EMPTY_STRING;
};

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

const getPropertyRequired = (schema: any, propertyId: string) => {
  const signatures = schema.ast?.[PROPERTY_SIGNATURES];
  const signature = signatures
    ? arrayFind(signatures, (sig: any) => sig.name === propertyId)
    : undefined;
  return signature ? !signature.isOptional : undefined;
};

export const createEffectSchematizer: typeof createEffectSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties, getPropertyRequired);
