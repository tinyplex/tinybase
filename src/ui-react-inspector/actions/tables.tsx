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
  useDelTableCallback,
  useSetCellCallback,
  useSetRowCallback,
  useSetTableCallback,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {
  ConfirmableActions,
  Delete,
  getNewIdFromSuggestedId,
  NewId,
} from './common.tsx';

const useHasTableCallback = (storeOrStoreId: StoreOrStoreId | undefined) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (tableId: Id) => store?.hasTable(tableId) ?? false,
    [store],
  );
};

const AddRow = ({
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

export const CloneTable = ({
  onDone,
  tableId,
  store: storeOrStoreId,
}: {onDone: () => void} & TableProps) => {
  const store = useStoreOrStoreById(storeOrStoreId)!;
  const has = useHasTableCallback(store);
  return (
    <NewId
      onDone={onDone}
      suggestedId={getNewIdFromSuggestedId(tableId, has)}
      has={has}
      set={useSetTableCallback(
        (tableId) => tableId,
        (_, store) => store.getTable(tableId),
      )}
    />
  );
};

const DeleteTable = ({
  onDone,
  tableId,
  store,
}: {onDone: () => void} & TableProps) => (
  <Delete onClick={useDelTableCallback(tableId, store, onDone)} />
);

export const TableActions1 = ({tableId, store}: TableProps) => (
  <ConfirmableActions
    actions={[['add', 'Add Row', AddRow]]}
    store={store}
    tableId={tableId}
  />
);
export const TableActions2 = ({tableId, store}: TableProps) => (
  <ConfirmableActions
    actions={[
      ['clone', 'Clone Table', CloneTable],
      ['delete', 'Delete Table', DeleteTable],
    ]}
    store={store}
    tableId={tableId}
  />
);

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

const AddCell = ({
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

const CloneRow = ({
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

const DeleteRow = ({
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
      ['add', 'Add Cell', AddCell],
      ['clone', 'Clone Row', CloneRow],
      ['delete', 'Delete Row', DeleteRow],
    ]}
    store={store}
    tableId={tableId}
    rowId={rowId}
  />
);
export const rowActions = [{label: '', component: RowActions}];
