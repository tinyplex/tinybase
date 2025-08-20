import type {Id} from '../../@types/index.d.ts';
import type {RowProps} from '../../@types/ui-react/index.d.ts';
import {useCallback} from '../../common/react.ts';
import {useDelRowCallback, useStoreOrStoreById} from '../../ui-react/index.ts';
import {Clone, ConfirmableActions, Delete} from './common.tsx';

const RowClone = ({
  onDone,
  tableId,
  rowId,
  store: storeOrId,
}: {onDone: () => void} & RowProps) => {
  const store = useStoreOrStoreById(storeOrId)!;
  const has = useCallback(
    (rowId: Id) => store.hasRow(tableId, rowId),
    [store, tableId],
  );
  const set = useCallback(
    (newId: Id) => store.setRow(tableId, newId, store.getRow(tableId, rowId)),
    [store, tableId, rowId],
  );
  return <Clone onDone={onDone} id={rowId} has={has} set={set} />;
};

const RowDelete = ({
  onDone,
  tableId,
  rowId,
  store,
}: {onDone: () => void} & RowProps) => (
  <Delete onClick={useDelRowCallback(tableId, rowId, store, onDone)} />
);

const RowActions = ({tableId, rowId, store}: RowProps) => (
  <ConfirmableActions
    actions={[
      ['clone', 'Clone Row', RowClone],
      ['delete', 'Delete Row', RowDelete],
    ]}
    store={store}
    tableId={tableId}
    rowId={rowId}
  />
);
export const rowActions = [{label: '', component: RowActions}];
