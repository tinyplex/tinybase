import type {Id} from '../../@types/index.d.ts';
import type {
  CellProps,
  RowProps,
  StoreOrStoreId,
  TableProps,
  TablesProps,
} from '../../@types/ui-react/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {objNew} from '../../common/obj.ts';
import {useCallback} from '../../common/react.ts';
import {
  useDelCellCallback,
  useDelRowCallback,
  useDelTableCallback,
  useDelTablesCallback,
  useHasTables,
  useSetCellCallback,
  useSetRowCallback,
  useSetTableCallback,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {
  Actions,
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

const AddTable = ({onDone, store}: {onDone: () => void} & TablesProps) => {
  const has = useHasTableCallback(store);
  return (
    <NewId
      onDone={onDone}
      suggestedId={getNewIdFromSuggestedId('table', has)}
      has={has}
      set={useSetTableCallback(
        (newId: Id) => newId,
        () => ({row: {cell: ''}}),
        [],
        store,
      )}
      prompt="Add table"
    />
  );
};

const DeleteTables = ({onDone, store}: {onDone: () => void} & TablesProps) => (
  <Delete
    onClick={useDelTablesCallback(store, onDone)}
    prompt="Delete all tables"
  />
);

export const TablesActions = ({store}: TablesProps) => (
  <Actions
    left={
      <ConfirmableActions
        actions={[['add', 'Add table', AddTable]]}
        store={store}
      />
    }
    right={
      useHasTables(store) ? (
        <ConfirmableActions
          actions={[['delete', 'Delete all tables', DeleteTables]]}
          store={store}
        />
      ) : null
    }
  />
);

// --

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
      prompt="Add row"
    />
  );
};

const CloneTable = ({
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
      prompt="Clone table to"
    />
  );
};

const DeleteTable = ({
  onDone,
  tableId,
  store,
}: {onDone: () => void} & TableProps) => (
  <Delete
    onClick={useDelTableCallback(tableId, store, onDone)}
    prompt="Delete table"
  />
);

export const TableActions1 = ({tableId, store}: TableProps) => (
  <ConfirmableActions
    actions={[['add', 'Add row', AddRow]]}
    store={store}
    tableId={tableId}
  />
);
export const TableActions2 = ({tableId, store}: TableProps) => (
  <ConfirmableActions
    actions={[
      ['clone', 'Clone table', CloneTable],
      ['delete', 'Delete table', DeleteTable],
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
      prompt="Add cell"
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
      prompt="Clone row to"
    />
  );
};

const DeleteRow = ({
  onDone,
  tableId,
  rowId,
  store,
}: {onDone: () => void} & RowProps) => (
  <Delete
    onClick={useDelRowCallback(tableId, rowId, store, onDone)}
    prompt="Delete row"
  />
);

export const RowActions = ({tableId, rowId, store}: RowProps) => (
  <ConfirmableActions
    actions={[
      ['add', 'Add cell', AddCell],
      ['clone', 'Clone row', CloneRow],
      ['delete', 'Delete row', DeleteRow],
    ]}
    store={store}
    tableId={tableId}
    rowId={rowId}
  />
);

// --

const CellDelete = ({
  onDone,
  tableId,
  rowId,
  cellId,
  store,
}: {onDone: () => void} & CellProps) => (
  <Delete
    onClick={useDelCellCallback(tableId, rowId, cellId, true, store, onDone)}
    prompt="Delete cell"
  />
);

export const CellActions = ({tableId, rowId, cellId, store}: CellProps) => (
  <ConfirmableActions
    actions={[['delete', 'Delete cell', CellDelete]]}
    store={store}
    tableId={tableId}
    rowId={rowId}
    cellId={cellId}
  />
);
