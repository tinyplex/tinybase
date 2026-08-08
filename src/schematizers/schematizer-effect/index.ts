import type {createEffectSchematizer as createEffectSchematizerDecl} from '../../@types/schematizers/schematizer-effect/index.d.ts';
import {
  arrayEvery,
  arrayFilter,
  arrayFind,
  arrayForEach,
  arrayMap,
} from '../../common/array.ts';
import {objNew, objSet} from '../../common/obj.ts';
import {isNull} from '../../common/other.ts';
import {
  ARRAY,
  BOOLEAN,
  BOOLEAN_KEYWORD,
  EMPTY_STRING,
  ENUM,
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
  getTypeOf,
} from '../../common/strings.ts';
import {getTypeOrTypeUnion} from '../common.ts';
import {createCustomSchematizer} from '../index.ts';

type TypeNode = any;

const UNDEFINED_KEYWORD = 'UndefinedKeyword';

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
    const nonNullTypes = arrayFilter(
      types,
      (t: TypeNode) =>
        !(t._tag === LITERAL && isNull(t.literal)) &&
        t._tag !== UNDEFINED_KEYWORD,
    );
    const hasNull = !!arrayFind(
      types,
      (t: TypeNode) => t._tag === LITERAL && isNull(t.literal),
    );
    if (
      arrayEvery(
        nonNullTypes,
        (t: TypeNode) =>
          t._tag === LITERAL && getSimpleType(t) !== EMPTY_STRING,
      )
    ) {
      return [
        {[ENUM]: arrayMap(nonNullTypes, (t: TypeNode) => t.literal)},
        defaultValue,
        allowNull || hasNull,
        required,
      ];
    }
    return [
      {
        [TYPE]: getTypeOrTypeUnion(arrayMap(nonNullTypes, getSimpleType)),
      },
      defaultValue,
      allowNull || hasNull,
      required,
    ];
  }

  if (type === LITERAL && getSimpleType(typeAst) !== EMPTY_STRING) {
    return [
      {[ENUM]: [typeAst.literal]},
      defaultValue,
      allowNull || false,
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
  const literalType = getTypeOf(ast?.literal);

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
      const properties = objNew<any>();
      arrayForEach(signatures, (sig: any) => {
        objSet(properties, sig.name, sig.type);
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
