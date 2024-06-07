/** @jsx createElement */

import {OPEN_CELL, STATE_TABLE} from './common';
import {ReactNode, SyntheticEvent} from 'react';
import {useCell, useSetCellCallback} from '../ui-react';
import {CURRENT_TARGET} from '../common/strings';
import type {Id} from '../@types/common';
import type {StoreProp} from './types';
import {createElement} from '../common/react';

export const Details = ({
  uniqueId,
  summary,
  editable,
  handleEditable,
  children,
  s,
}: {
  readonly uniqueId: Id;
  readonly summary: ReactNode;
  readonly editable?: boolean;
  readonly handleEditable?: (event: SyntheticEvent<HTMLImageElement>) => void;
  readonly children: ReactNode;
} & StoreProp) => {
  const open = !!useCell(STATE_TABLE, uniqueId, OPEN_CELL, s);
  const handleToggle = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    OPEN_CELL,
    (event: React.SyntheticEvent<HTMLDetailsElement>) =>
      event[CURRENT_TARGET].open,
    [],
    s,
  );
  return (
    <details open={open} onToggle={handleToggle}>
      <summary>
        {summary}
        {handleEditable ? (
          <img
            onClick={handleEditable}
            className={editable ? 'done' : 'edit'}
          />
        ) : null}
      </summary>
      {children}
    </details>
  );
};
