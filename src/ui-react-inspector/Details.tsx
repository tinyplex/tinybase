import type {ReactNode, SyntheticEvent} from 'react';
import type {Id} from '../@types/common/index.d.ts';
import {CURRENT_TARGET} from '../common/strings.ts';
import {useCell, useSetCellCallback} from '../ui-react/index.ts';
import {OPEN_CELL, STATE_TABLE} from './common.ts';
import type {StoreProp} from './types.ts';

export const Details = ({
  uniqueId,
  title,
  editable,
  handleEditable,
  children,
  s,
}: {
  readonly uniqueId: Id;
  readonly title: ReactNode;
  readonly editable?: boolean;
  readonly handleEditable?: (event: SyntheticEvent<HTMLImageElement>) => void;
  readonly children: ReactNode;
} & StoreProp) => {
  const open = !!useCell(STATE_TABLE, uniqueId, OPEN_CELL, s);
  const handleToggle = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    OPEN_CELL,
    (event: SyntheticEvent<HTMLDetailsElement>) => event[CURRENT_TARGET].open,
    [],
    s,
  );
  return (
    <details open={open} onToggle={handleToggle}>
      <summary>
        <span>{title}</span>
        {handleEditable ? (
          <img
            onClick={handleEditable}
            className={editable ? 'done' : 'edit'}
            title={editable ? 'Done editing' : 'Edit'}
          />
        ) : null}
      </summary>
      <div>{children}</div>
    </details>
  );
};
