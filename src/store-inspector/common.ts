import {Id} from '../types/common';
import {jsonString} from '../common/json';

export const UNIQUE_ID = 'tinybaseStoreInspector';
export const TITLE = 'TinyBase Store Inspector';
export const POSITIONS = ['top', 'right', 'bottom', 'left', 'full'];

export const getUniqueId = (...args: (Id | undefined)[]) => jsonString(args);
