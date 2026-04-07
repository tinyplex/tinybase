import type {Id, Ids} from '../../@types/common/index.d.ts';
import {arrayMap, arraySort} from '../array.ts';
import {jsonStringWithMap} from '../json.ts';

export const UNIQUE_ID = 'tinybaseInspector';
export const TITLE = 'TinyBase Inspector';
export const POSITIONS = ['left', 'top', 'bottom', 'right', 'full'];

export const STATE_TABLE = 'state';
export const SORT_CELL = 'sort';
export const OPEN_CELL = 'open';
export const POSITION_VALUE = 'position';
export const OPEN_VALUE = OPEN_CELL;

export const NO_PROVIDED_OBJECTS_MESSAGE =
  'There are no Stores or other objects to inspect. Make sure you placed ' +
  'the Inspector inside a Provider component.';
export const INSPECTOR_ERROR_MESSAGE =
  'Inspector error: please see console for details.';

export const getInitialPosition = (position: string) => {
  const index = POSITIONS.indexOf(position);
  return index == -1 ? 1 : index;
};

export const getUniqueId = (...args: (Id | undefined)[]) =>
  jsonStringWithMap(args);

export const sortedIdsMap = <Return>(
  ids: Ids,
  callback: (id: Id) => Return,
): Return[] => arrayMap(arraySort([...ids]), callback);
