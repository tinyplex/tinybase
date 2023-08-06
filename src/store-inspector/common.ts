import {Id, Ids} from '../types/common';
import {arrayMap} from '../common/array';
import {jsonString} from '../common/json';

export const UNIQUE_ID = 'tinybaseStoreInspector';
export const TITLE = 'TinyBase Store Inspector';
export const POSITIONS = ['left', 'top', 'bottom', 'right', 'full'];

export const STATE_TABLE = 'state';
export const SORT_CELL = 'sort';
export const OPEN_CELL = 'open';
export const POSITION_VALUE = 'position';
export const OPEN_VALUE = OPEN_CELL;
export const SCROLL_X_VALUE = 'scrollX';
export const SCROLL_Y_VALUE = 'scrollY';

export const getUniqueId = (...args: (Id | undefined)[]) => jsonString(args);

export const sortedIdsMap = <Return>(
  ids: Ids,
  callback: (id: Id) => Return,
): Return[] => arrayMap(ids.sort(), callback);
