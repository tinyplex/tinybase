import {
  IdMap,
  mapEnsure,
  mapForEach,
  mapMap,
  mapNew,
  mapSet,
} from '../common/map';
import {IdSet2, setAdd, setNew} from '../common/set';
import {Pair, pairNewMap} from '../common/pairs';
import {
  arrayForEach,
  arrayMap,
  arrayPop,
  arrayPush,
  arrayShift,
  arraySort,
} from '../common/array';
import {collHas, collValues} from '../common/coll';
import {isArray, test} from '../common/other';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../common.d';

const NON_ALPHANUMERIC = /[^A-Za-z0-9]+/;
const CLOSING = /^[\])}]/;
const OPENING = /[[({]$/;
const INLINE_ARROW = /=> /;
const LINE = '\n';

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

export const length = (str: string) => str.length;

export const join = (str: string[], sep = EMPTY_STRING) => str.join(sep);

export const camel = (str: string, firstCap = false) =>
  join(
    arrayMap(
      str.split(NON_ALPHANUMERIC),
      (word, w) =>
        (w > 0 || firstCap ? upper : lower)(substr(word, 0, 1)) +
        substr(word, 1),
    ),
  );

export const getCodeFunctions = (): [
  (...lines: string[]) => string,
  (location: 0 | 1, source: string, ...items: string[]) => void,
  (name: Id, body: string) => Id,
  (name: Id, parameters: string, returnType: string, body: string) => Id,
  (name: Id, parameters: string, body: string | string[]) => Id,
  (name: Id, body: string | string[]) => Id,
  (location: 0 | 1) => string[],
  () => string[],
  (location: 0 | 1) => string[],
  () => string[],
] => {
  const allImports: Pair<IdSet2> = pairNewMap();
  const types: IdMap<string> = mapNew();
  const methods: IdMap<[parameters: string, returnType: string, body: string]> =
    mapNew();
  const constants: IdMap<string[]> = mapNew();

  const build = (...lines: string[]): string => {
    let indent = 0;
    return (
      lines
        .map(
          (line) =>
            EMPTY_STRING.padStart(
              (CLOSING.test(line)
                ? --indent
                : OPENING.test(line)
                ? indent++
                : line == EMPTY_STRING
                ? 0
                : indent) * 2,
            ) +
            (length(line) > 80 - indent * 2 && test(INLINE_ARROW, line)
              ? line.replace(
                  INLINE_ARROW,
                  `=>\n${EMPTY_STRING.padStart(indent * 2 + 2)}`,
                )
              : line),
        )
        .join(LINE) + LINE
    );
  };

  const addImport = (location: 0 | 1, source: string, ...items: string[]) =>
    arrayForEach(items, (item) =>
      setAdd(mapEnsure(allImports[location], source, setNew), item),
    );

  const addType = (name: Id, body: string): Id => mapUnique(types, name, body);

  const addMethod = (
    name: Id,
    parameters: string,
    returnType: string,
    body: string,
  ): Id => mapUnique(methods, name, [parameters, returnType, body]);

  const addFunction = (
    name: Id,
    parameters: string,
    body: string | string[],
  ): Id =>
    mapUnique(
      constants,
      name,
      isArray(body)
        ? [`(${parameters}) => {`, ...body, '}']
        : [`(${parameters}) => ${body}`],
    );

  const addConstant = (name: Id, body: string | string[]): Id =>
    mapUnique(constants, name, isArray(body) ? body : [body]);

  const getImports = (location: 0 | 1): string[] => [
    ...arraySort(
      mapMap(
        allImports[location],
        (items, source) =>
          `import {${join(
            arraySort(collValues(items)),
            ', ',
          )}} from '${source}';`,
      ),
    ),
    EMPTY_STRING,
  ];

  const getTypes = (): string[] =>
    mapMap(types, (body, name) => `export type ${name} = ${body};${LINE}`);

  const getMethods = (location: 0 | 1): string[] =>
    mapMap(methods, ([parameters, returnType, body], name) =>
      location
        ? `${name}: (${parameters}): ${returnType} => ${body},${LINE}`
        : `${name}(${parameters}): ${returnType};${LINE}`,
    );

  const getConstants = (): string[] => {
    const lines: string[] = [];
    mapForEach(constants, (name, body) => {
      arrayPush(body, `${arrayPop(body)};${LINE}`);
      arrayPush(lines, `const ${name} = ${arrayShift(body)}`, ...body);
    });
    return lines;
  };

  return [
    build,
    addImport,
    addType,
    addMethod,
    addFunction,
    addConstant,
    getImports,
    getTypes,
    getMethods,
    getConstants,
  ];
};
