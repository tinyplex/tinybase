import type {SyntheticEvent} from 'react';
import type {Id} from '../@types/common/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import {STATE_TABLE} from '../common/inspector/common.ts';
import {useCallback} from '../common/react.ts';
import {useCell} from '../ui-react/index.ts';
export * from '../common/inspector/common.ts';

const EDITABLE_CELL = 'editable';

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
