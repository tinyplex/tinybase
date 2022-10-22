import {arrayMap, arrayPush} from '../common/array';
import {EMPTY_STRING} from '../common/strings';

const NON_ALPHANUMERIC = /[^A-Za-z0-9]+/;
const CLOSING = /^[\])}]/;
const OPENING = /[[({]$/;

const join = (str: string[], sep = '') => str.join(sep);

const substr = (str: string, start: number, end?: number) =>
  str.substring(start, end);

const upper = (str: string) => str.toUpperCase();

const lower = (str: string) => str.toLowerCase();

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
  (...lines: string[]) => void,
  () => string,
] => {
  const allLines: string[] = [];
  const add = (...lines: string[]) =>
    lines.forEach((line) => arrayPush(allLines, line.trim()));
  const build = () => {
    let indent = 0;
    return allLines
      .map(
        (line) =>
          EMPTY_STRING.padStart(
            (CLOSING.test(line)
              ? --indent
              : OPENING.test(line)
              ? indent++
              : indent) * 2,
          ) + line,
      )
      .join('\n');
  };
  return [add, build];
};
