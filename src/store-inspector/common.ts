import {Id} from '../types/common';
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
