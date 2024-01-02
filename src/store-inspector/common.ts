import {Id, Ids} from '../types/common';
import {arrayMap, arraySort} from '../common/array';
import {Store} from '../types/store';
import {jsonString} from '../common/json';
import {useCallback} from '../ui-react/common';
import {useCell} from '../ui-react';

export const UNIQUE_ID = 'tinybaseStoreInspector';
export const TITLE = 'TinyBase Store Inspector';
export const POSITIONS = ['left', 'top', 'bottom', 'right', 'full'];

export const STATE_TABLE = 'state';
export const SORT_CELL = 'sort';
export const OPEN_CELL = 'open';
export const POSITION_VALUE = 'position';
export const OPEN_VALUE = OPEN_CELL;

const EDITABLE_CELL = 'editable';

export const getUniqueId = (...args: (Id | undefined)[]) => jsonString(args);

export const sortedIdsMap = <Return>(
  ids: Ids,
  callback: (id: Id) => Return,
): Return[] => arrayMap(arraySort(ids), callback);

export const useEditable = (
  uniqueId: Id,
  s: Store,
): [boolean, (event: React.SyntheticEvent<HTMLImageElement>) => void] => [
  !!useCell(STATE_TABLE, uniqueId, EDITABLE_CELL, s),
  useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      s.setCell(STATE_TABLE, uniqueId, EDITABLE_CELL, (editable) => !editable);
      event.preventDefault();
    },
    [s, uniqueId],
  ),
];
