import {IdMap, mapEnsure, mapGet, mapMap, mapNew, mapSet} from '../common/map';
import {IdSet2, setAdd, setNew} from '../common/set';
import {
  arrayForEach,
  arrayMap,
  arrayPop,
  arrayPush,
  arrayShift,
  arraySort,
  arrayUnshift,
} from '../common/array';
import {collHas, collValues} from '../common/coll';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../common.d';
import {isArray} from '../common/other';
import {pairNewMap} from '../common/pairs';

type LINE = string;
type LINES = LINE[];
type LINE_TREE = LINE_OR_LINE_TREE[];
type LINE_OR_LINE_TREE = LINE | LINE_TREE;

const NON_ALPHA = /[^A-Za-z]+/;
const NON_ALPHANUMERIC = /[^A-Za-z0-9]+/;
const JSDOC = /^( *)\/\*\* *(.*?) *\*\/$/gm;

const substr = (str: string, start: number, end?: number) =>
  str.substring(start, end);

const upper = (str: string) => str.toUpperCase();

const lower = (str: string) => str.toLowerCase();

const mapUnique = <Value>(
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
    const lineLength = 77 - length(indent);
    return `${indent}/**\n${text.replace(
      new RegExp(`([^\\n]{1,${lineLength}})(\\s|$)`, 'g'),
      `${indent} * $1\n`,
    )}${indent} */`;
  });

export const length = (str: string) => str.length;

export const join = (array: string[], sep = EMPTY_STRING) => array.join(sep);

export const flat = (array: any[]) => array.flat(1e3);

export const camel = (str: string, firstCap = 0) =>
  join(
    arrayMap(
      str.split(NON_ALPHANUMERIC),
      (word, w) =>
        (w > 0 || firstCap ? upper : lower)(substr(word, 0, 1)) +
        substr(word, 1),
    ),
  );

export const snake = (str: string) =>
  upper(
    join(
      (str && !NON_ALPHA.test(str[0]) ? str : ' ' + str).split(
        NON_ALPHANUMERIC,
      ),
      '_',
    ),
  );

export const comment = (doc: string) => `/** ${doc}. */`;

export const getCodeFunctions = (): [
  (...lines: LINE_TREE) => string,
  (location: 0 | 1, react: 0 | 1, source: string, ...items: string[]) => void,
  (name: Id, body: LINE, doc: string, react?: 0 | 1) => Id,
  (
    name: Id,
    parameters: LINE,
    returnType: string,
    body: LINE,
    doc: string,
    generic?: string,
  ) => Id,
  (
    name: Id,
    parameters: LINE,
    returnType: string,
    body: LINE,
    doc: string,
    uiReactModuleDefinition: string,
    generic?: string,
  ) => Id,
  (name: Id, parameters: string, body: LINE_OR_LINE_TREE) => Id,
  (name: Id, body: LINE_OR_LINE_TREE, react?: 0 | 1) => Id,
  (location?: 0 | 1, react?: 0 | 1) => LINES,
  (react?: 0 | 1) => LINE_TREE,
  (location?: 0 | 1) => LINE_TREE,
  (location?: 0 | 1) => LINE_TREE,
  (react?: 0 | 1) => LINE_TREE,
] => {
  const allImports: [IdSet2, IdSet2, IdSet2, IdSet2] = [
    mapNew(),
    mapNew(),
    mapNew(),
    mapNew(),
  ];
  const types: [IdMap<[LINE, string]>, IdMap<[LINE, string]>] = pairNewMap();
  const methods: IdMap<
    [
      parameters: LINE,
      returnType: string,
      body: LINE,
      doc: string,
      generic: string,
    ]
  > = mapNew();
  const hooks: IdMap<
    [
      parameters: LINE,
      returnType: string,
      body: LINE,
      doc: string,
      generic: string,
    ]
  > = mapNew();
  const constants: [IdMap<LINE_OR_LINE_TREE>, IdMap<LINE_OR_LINE_TREE>] =
    pairNewMap();

  const build = (...lines: LINE_TREE): string => join(flat(lines), '\n');

  const addImport = (
    location: 0 | 1,
    react: 0 | 1,
    source: string,
    ...items: string[]
  ) =>
    arrayForEach(items, (item) =>
      setAdd(mapEnsure(allImports[location + react * 2], source, setNew), item),
    );

  const addType = (name: Id, body: LINE, doc: string, react: 0 | 1 = 0): Id =>
    mapUnique(types[react], name, [body, doc]);

  const addMethod = (
    name: Id,
    parameters: LINE,
    returnType: string,
    body: LINE,
    doc: string,
    generic = '',
  ): Id =>
    mapUnique(methods, name, [parameters, returnType, body, doc, generic]);

  const addHook = (
    name: Id,
    parameters: LINE,
    returnType: string,
    body: LINE,
    doc: string,
    uiReactModuleDefinition: string,
    generic = '',
  ): Id => {
    addImport(1, 1, uiReactModuleDefinition, `${name} as ${name}Decl`);
    return mapUnique(hooks, name, [parameters, returnType, body, doc, generic]);
  };

  const addFunction = (
    name: Id,
    parameters: string,
    body: LINE_OR_LINE_TREE,
  ): Id =>
    mapUnique(
      constants[0],
      name,
      isArray(body)
        ? [`(${parameters}) => {`, body, '}']
        : [`(${parameters}) => ${body}`],
    );

  const addConstant = (
    name: Id,
    body: LINE_OR_LINE_TREE,
    react: 0 | 1 = 0,
  ): Id =>
    mapGet(constants[react], name) === body
      ? name
      : mapUnique(constants[react], name, body);

  const getImports = (location: 0 | 1 = 0, react: 0 | 1 = 0): LINES =>
    arrayMap(
      [
        ...arraySort(
          mapMap(
            allImports[location + react * 2],
            (items, source) =>
              `import {${join(
                arraySort(collValues(items)),
                ', ',
              )}} from '${source}';`,
          ),
        ),
        EMPTY_STRING,
      ],
      (line) => line.replace('{React}', 'React'), // sigh
    );

  const getTypes = (react: 0 | 1 = 0): LINE_TREE =>
    mapMap(types[react], ([body, doc], name) => [
      comment(doc),
      `export type ${name} = ${body};`,
      EMPTY_STRING,
    ]);

  const getMethods = (location: 0 | 1 = 0): LINE_TREE =>
    mapMap(methods, ([parameters, returnType, body, doc, generic], name) => {
      const lines = location
        ? [`${name}: ${generic}(${parameters}): ${returnType} => ${body},`]
        : [`${name}${generic}(${parameters}): ${returnType};`];
      if (!location) {
        arrayUnshift(lines, comment(doc));
      }
      arrayPush(lines, EMPTY_STRING);
      return lines;
    });

  const getHooks = (location: 0 | 1 = 0): LINE_TREE =>
    mapMap(hooks, ([parameters, returnType, body, doc, generic], name) => {
      const lines = location
        ? [
            `export const ${name}: typeof ${name}Decl = ${generic}` +
              `(${parameters}): ${returnType} => ${body};`,
          ]
        : [`export function ${name}${generic}(${parameters}): ${returnType};`];
      if (!location) {
        arrayUnshift(lines, comment(doc));
      }
      arrayPush(lines, EMPTY_STRING);
      return lines;
    });

  const getConstants = (react: 0 | 1 = 0): LINE_TREE =>
    mapMap(constants[react], (body, name) => {
      body = isArray(body) ? body : [body];
      arrayPush(body, `${arrayPop(body)};`);
      return [`const ${name} = ${arrayShift(body)}`, body, EMPTY_STRING];
    });

  return [
    build,
    addImport,
    addType,
    addMethod,
    addHook,
    addFunction,
    addConstant,
    getImports,
    getTypes,
    getMethods,
    getHooks,
    getConstants,
  ];
};
