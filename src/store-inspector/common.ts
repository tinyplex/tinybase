import {useCell, useSetCellCallback} from '../ui-react';
import {CURRENT_TARGET} from '../common/strings';
import {Id} from '../types/common';
import {Store} from '../types/store';
import {jsonString} from '../common/json';

export const UNIQUE_ID = 'tinybaseStoreInspector';
export const TITLE = 'TinyBase Store Inspector';
export const POSITIONS = ['top', 'right', 'bottom', 'left'];

export const getUniqueId = (...args: (Id | undefined)[]) => jsonString(args);

export const useOpen = (
  thingType: Id,
  thingId: Id,
  inspectorStore: Store,
): [boolean, (event: React.SyntheticEvent<HTMLDetailsElement>) => void] => [
  !!useCell(thingType, thingId, 'open', inspectorStore),
  useSetCellCallback(
    thingType,
    thingId,
    'open',
    (event: React.SyntheticEvent<HTMLDetailsElement>) =>
      event[CURRENT_TARGET].open,
    [],
    inspectorStore,
  ),
];
