import {OPEN_CELL, STATE_TABLE} from './common';
import {useCell, useSetCellCallback} from '../ui-react';
import {CURRENT_TARGET} from '../common/strings';
import {Id} from '../types/common';
import React from 'react';
import {StoreProp} from './types';

export const Details = ({
  uniqueId,
  summary,
  children,
  s,
}: {
  readonly uniqueId: Id;
  readonly summary: string;
  readonly children: React.ReactNode;
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
      <summary>{summary}</summary>
      {children}
    </details>
  );
};
