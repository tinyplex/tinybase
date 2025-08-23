import type {Id} from '../../@types/index.d.ts';
import type {
  RowProps,
  StoreOrStoreId,
  TableProps,
} from '../../@types/ui-react/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {objNew} from '../../common/obj.ts';
import {useCallback} from '../../common/react.ts';
import {
  useDelRowCallback,
  useSetCellCallback,
  useSetRowCallback,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {
  ConfirmableActions,
  Delete,
  getNewIdFromSuggestedId,
  NewId,
} from './common.tsx';

const useHasRowCallback = (
  storeOrStoreId: StoreOrStoreId | undefined,
  tableId: Id,
) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (rowId: Id) => store?.hasRow(tableId, rowId) ?? false,
    [store, tableId],
  );
};

const RowAddCell = ({
  onDone,
  tableId,
  rowId,
  store: storeOrStoreId,
}: {onDone: () => void} & RowProps) => {
  const store = useStoreOrStoreById(storeOrStoreId)!;
  const has = useCallback(
    (cellId: Id) => store.hasCell(tableId, rowId, cellId),
    [store, tableId, rowId],
  );
  return (
    <NewId
      onDone={onDone}
      suggestedId={getNewIdFromSuggestedId('cell', has)}
      has={has}
      set={useSetCellCallback(
        tableId,
        rowId,
        (newId: string) => newId,
        () => '',
        [],
        store,
      )}
    />
  );
};

export const RowAdd = ({
  onDone,
  tableId,
  store,
}: {onDone: () => void} & TableProps) => {
  const has = useHasRowCallback(store, tableId);
  return (
    <NewId
      onDone={onDone}
      suggestedId={getNewIdFromSuggestedId('row', has)}
      has={has}
      set={useSetRowCallback(
        tableId,
        (newId) => newId,
        (_, store) =>
          objNew(
            arrayMap(store.getTableCellIds(tableId), (cellId) => [cellId, '']),
          ),
      )}
    />
  );
};

const RowClone = ({
  onDone,
  tableId,
  rowId,
  store: storeOrStoreId,
}: {onDone: () => void} & RowProps) => {
  const store = useStoreOrStoreById(storeOrStoreId)!;
  const has = useHasRowCallback(store, tableId);
  return (
    <NewId
      onDone={onDone}
      suggestedId={getNewIdFromSuggestedId(rowId, has)}
      has={has}
      set={useSetRowCallback(
        tableId,
        (newId) => newId,
        (_, store) => store.getRow(tableId, rowId),
        [rowId],
      )}
    />
  );
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
      ['add', 'Add Cell', RowAddCell],
      ['clone', 'Clone Row', RowClone],
      ['delete', 'Delete Row', RowDelete],
    ]}
    store={store}
    tableId={tableId}
    rowId={rowId}
  />
);
export const rowActions = [{label: '', component: RowActions}];
