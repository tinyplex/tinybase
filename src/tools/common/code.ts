import {COMMA, EMPTY_STRING} from '../../common/strings';
import {EXPORT, lower, upper} from './strings';
import {
  IdMap,
  mapEnsure,
  mapGet,
  mapMap,
  mapNew,
  mapSet,
} from '../../common/map';
import {IdSet2, setAdd, setNew} from '../../common/set';
import {
  arrayFilter,
  arrayForEach,
  arrayJoin,
  arrayMap,
  arrayPop,
  arrayPush,
  arrayShift,
  arraySort,
} from '../../common/array';
import {collHas, collValues} from '../../common/coll';
import {isArray, size, slice} from '../../common/other';
import type {Id} from '../../@types/common';

export type LINE = string;
export type LINE_TREE = LINE_OR_LINE_TREE[];
export type LINE_OR_LINE_TREE = LINE | LINE_TREE;

const NON_ALPHA = /[^A-Za-z]+/;
const NON_ALPHANUMERIC = /[^A-Za-z0-9]+/;
const JSDOC = /^( *)\/\*\* *(.*?) *\*\/$/gm;

const stringHasComma = (str: string) => str.includes(COMMA);

export const mapUnique = <Value>(
  map: IdMap<Value>,
  id: Id,
  value: Value,
  index = 1,
): Id => {
  const uniqueId = `${id}${index == 1 ? '' : index}`;
  if (collHas(map, uniqueId)) {
    return mapUnique(map, id, value, index + 1);
  } else {
    mapSet(map, uniqueId, value);
    return uniqueId;
  }
};

export const formatJsDoc = (file: string): string =>
  file.replace(JSDOC, (_, indent, text) => {
    const lineLength = 77 - size(indent);
    return `${indent}/**\n${text.replace(
      new RegExp(`([^\\n]{1,${lineLength}})(\\s|$)`, 'g'),
      `${indent} * $1\n`,
    )}${indent} */`;
  });

export const flat = (array: any[]) => array.flat(1e3);

export const camel = (str: string, firstCap = 0) =>
  arrayJoin(
    arrayMap(
      str.split(NON_ALPHANUMERIC),
      (word, w) =>
        (w > 0 || firstCap ? upper : lower)(slice(word, 0, 1)) + slice(word, 1),
    ),
  );

export const snake = (str: string) =>
  upper(
    arrayJoin(
      (str && !NON_ALPHA.test(str[0]) ? str : ' ' + str).split(
        NON_ALPHANUMERIC,
      ),
      '_',
    ),
  );

export const comment = (doc: string) => `/** ${doc}. */`;

export const getParameterList = (...params: string[]) =>
  arrayJoin(
    arrayFilter(params, (param) => param as any),
    ', ',
  );

export const getFieldTypeList = (...props: string[]) =>
  '{' + arrayJoin(props, '; ') + '}';

export const getPropTypeList = (...props: string[]) =>
  getFieldTypeList(...arrayMap(props, (prop) => 'readonly ' + prop));

export const getCodeFunctions = (): [
  (...lines: LINE_TREE) => string,
  (location: null | 0 | 1, source: string, ...items: string[]) => void,
  (name: Id, body: LINE, doc: string, generic?: string, exported?: 0 | 1) => Id,
  (name: Id, parameters: string, body: LINE_OR_LINE_TREE) => Id,
  (name: Id, body: LINE_OR_LINE_TREE) => Id,
  (location?: 0 | 1) => LINE[],
  () => LINE_TREE,
  () => LINE_TREE,
] => {
  const allImports: [IdSet2, IdSet2, IdSet2, IdSet2] = [
    mapNew(),
    mapNew(),
    mapNew(),
    mapNew(),
  ];
  const types: IdMap<[LINE, string, string, 0 | 1]> = mapNew();
  const constants: IdMap<LINE_OR_LINE_TREE> = mapNew();

  const build = (...lines: LINE_TREE): string => arrayJoin(flat(lines), '\n');

  const addImport = (
    location: null | 0 | 1,
    source: string,
    ...items: string[]
  ) =>
    arrayForEach(items, (item) =>
      arrayForEach([0, 1], (eachLocation) =>
        (location ?? eachLocation) == eachLocation
          ? setAdd(mapEnsure(allImports[eachLocation], source, setNew), item)
          : 0,
      ),
    );

  const addType = (
    name: Id,
    body: LINE,
    doc: string,
    generic = EMPTY_STRING,
    exported = 1,
  ): Id => mapUnique(types, name, [body, doc, generic, exported]);

  const addInternalFunction = (
    name: Id,
    parameters: string,
    body: LINE_OR_LINE_TREE,
  ): Id =>
    mapUnique(
      constants,
      name,
      isArray(body)
        ? [`(${parameters}) => {`, body, '}']
        : [`(${parameters}) => ${body}`],
    );

  const addConstant = (name: Id, body: LINE_OR_LINE_TREE): Id =>
    mapGet(constants, name) === body ? name : mapUnique(constants, name, body);

  const getSortableImport = (importMaybeAs: string): string => {
    const as = importMaybeAs.indexOf(' as ');
    return as != -1 ? slice(importMaybeAs, as + 4) : importMaybeAs;
  };

  const getImports = (location: 0 | 1 = 0): LINE[] =>
    arrayMap(
      [
        ...arraySort(
          mapMap(
            allImports[location],
            (items, source) =>
              `import {${arrayJoin(
                arraySort(collValues(items), (import1, import2) =>
                  getSortableImport(import1) > getSortableImport(import2)
                    ? 1
                    : -1,
                ),
                ', ',
              )}} from '${source}';`,
          ),
          (import1, import2) =>
            stringHasComma(import1) != stringHasComma(import2)
              ? stringHasComma(import1)
                ? -1
                : 1
              : import1 > import2
                ? 1
                : -1,
        ),
        EMPTY_STRING,
      ],
      (line) => line.replace('{React}', 'React'), // sigh
    );

  const getTypes = (): LINE_TREE =>
    mapMap(types, ([body, doc, generic, exported], name) => [
      comment(doc),
      `${
        exported ? EXPORT + ' ' : EMPTY_STRING
      }type ${name}${generic} = ${body};`,
      EMPTY_STRING,
    ]);

  const getConstants = (): LINE_TREE =>
    mapMap(constants, (body, name) => {
      body = isArray(body) ? body : [body];
      arrayPush(body, `${arrayPop(body)};`);
      return [`const ${name} = ${arrayShift(body)}`, body, EMPTY_STRING];
    });

  return [
    build,
    addImport,
    addType,
    addInternalFunction,
    addConstant,
    getImports,
    getTypes,
    getConstants,
  ];
};
