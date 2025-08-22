import type {CellProps} from '../../@types/ui-react/index.d.ts';
import {useDelCellCallback} from '../../ui-react/index.ts';
import {ConfirmableActions, Delete} from './common.tsx';

const CellDelete = ({
  onDone,
  tableId,
  rowId,
  cellId,
  store,
}: {onDone: () => void} & CellProps) => (
  <Delete
    onClick={useDelCellCallback(tableId, rowId, cellId, true, store, onDone)}
  />
);

export const CellActions = ({tableId, rowId, cellId, store}: CellProps) => (
  <ConfirmableActions
    actions={[['delete', 'Delete Cell', CellDelete]]}
    store={store}
    tableId={tableId}
    rowId={rowId}
    cellId={cellId}
  />
);
