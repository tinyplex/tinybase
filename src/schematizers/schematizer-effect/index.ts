import type {createEffectSchematizer as createEffectSchematizerDecl} from '../../@types/schematizers/schematizer-effect/index.d.ts';
import {
  arrayEvery,
  arrayFilter,
  arrayFind,
  arrayForEach,
  arrayMap,
  arrayPush,
} from '../../common/array.ts';
import {objNew, objSet} from '../../common/obj.ts';
import {
  ARRAY,
  BOOLEAN,
  EMPTY_STRING,
  ENUM,
  LITERAL,
  NUMBER,
  OBJECT,
  PROPERTY_SIGNATURES,
  STRING,
  TYPE,
  UNION,
  getTypeOf,
} from '../../common/strings.ts';
import {getTypeOrTypeUnion} from '../common.ts';
import {createCustomSchematizer} from '../index.ts';

type TypeNode = any;

const STRING_TAG = 'String';
const NUMBER_TAG = 'Number';
const BOOLEAN_TAG = 'Boolean';
const ARRAYS_TAG = 'Arrays';
const OBJECTS_TAG = 'Objects';
const NULL_TAG = 'Null';
const UNDEFINED_TAG = 'Undefined';

const getUnionTypes = (ast: TypeNode, types: TypeNode[] = []): TypeNode[] => {
  if (ast._tag === UNION) {
    arrayForEach(ast.types, (type: TypeNode) => getUnionTypes(type, types));
  } else {
    arrayPush(types, ast);
  }
  return types;
};

const unwrapSchema = (
  schema: TypeNode,
  defaultValue?: any,
  allowNull?: boolean,
  required = true,
): [any, any, boolean, boolean] => {
  const ast = schema.ast || schema;
  required = required && !ast.context?.isOptional;
  const type = ast._tag;
  if (type === UNION) {
    const types = getUnionTypes(ast);
    const nonNullTypes = arrayFilter(
      types,
      (t: TypeNode) => t._tag !== NULL_TAG && t._tag !== UNDEFINED_TAG,
    );
    const hasNull = !!arrayFind(types, (t: TypeNode) => t._tag === NULL_TAG);
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

  if (type === LITERAL && getSimpleType(ast) !== EMPTY_STRING) {
    return [
      {[ENUM]: [ast.literal]},
      defaultValue,
      allowNull || false,
      required,
    ];
  }

  return [
    {[TYPE]: getSimpleType(ast)},
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
    : tag === STRING_TAG
      ? STRING
      : tag === NUMBER_TAG
        ? NUMBER
        : tag === BOOLEAN_TAG
          ? BOOLEAN
          : tag === ARRAYS_TAG
            ? ARRAY
            : tag === OBJECTS_TAG
              ? OBJECT
              : EMPTY_STRING;
};

const getProperties = (schema: any) => {
  const ast = schema.ast;
  if (ast._tag === OBJECTS_TAG) {
    const properties = objNew<any>();
    arrayForEach(ast[PROPERTY_SIGNATURES], (sig: any) => {
      objSet(properties, sig.name, sig.type);
    });
    return properties;
  }
};

export const createEffectSchematizer: typeof createEffectSchematizerDecl = () =>
  createCustomSchematizer(unwrapSchema, getProperties);
