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
  const open = !!useCell('state', uniqueId, 'open', s);
  const handleToggle = useSetCellCallback(
    'state',
    uniqueId,
    'open',
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
