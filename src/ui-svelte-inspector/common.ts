import type {Id, Ids} from '../@types/common/index.d.ts';
import {arrayMap, arraySort} from '../common/array.ts';
import {jsonStringWithMap} from '../common/json.ts';

export const UNIQUE_ID = 'tinybaseInspector';
export const TITLE = 'TinyBase Inspector';
export const POSITIONS = ['left', 'top', 'bottom', 'right', 'full'];

export const STATE_TABLE = 'state';
export const SORT_CELL = 'sort';
export const OPEN_CELL = 'open';
export const POSITION_VALUE = 'position';
export const OPEN_VALUE = OPEN_CELL;

export const getUniqueId = (...args: (Id | undefined)[]) =>
  jsonStringWithMap(args);

export const sortedIdsMap = <Return>(
  ids: Ids,
  callback: (id: Id) => Return,
): Return[] => arrayMap(arraySort([...ids]), callback);
