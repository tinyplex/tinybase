import type {SyntheticEvent} from 'react';
import type {Id} from '../@types/common/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import {EDITABLE_CELL, STATE_TABLE} from '../common/inspector/common.ts';
import {useCallback} from '../common/react.ts';
import {useCell} from '../ui-react/index.ts';

export const useEditable = (
  uniqueId: Id,
  s: Store,
): [boolean, (event: SyntheticEvent<HTMLImageElement>) => void] => [
  !!useCell(STATE_TABLE, uniqueId, EDITABLE_CELL, s),
  useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      s.setCell(STATE_TABLE, uniqueId, EDITABLE_CELL, (editable) => !editable);
      event.preventDefault();
    },
    [s, uniqueId],
  ),
];
