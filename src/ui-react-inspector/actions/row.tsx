import type {Id} from '../../@types/index.d.ts';
import type {RowProps} from '../../@types/ui-react/index.d.ts';
import {useCallback, useState} from '../../common/react.ts';
import {useDelRowCallback, useStoreOrStoreById} from '../../ui-react/index.ts';
import {Clone, clonedId, ConfirmableActions, Delete} from './common.tsx';

const RowAddCell = ({
  onDone,
  tableId,
  rowId,
  store: storeOrId,
}: {onDone: () => void} & RowProps) => {
  const store = useStoreOrStoreById(storeOrId)!;
  const has = useCallback(
    (cellId: Id) => store.hasCell(tableId, rowId, cellId),
    [store, tableId, rowId],
  );
  const cloneId = useCallback(
    () => clonedId(store.getCellIds(tableId, rowId)[0], has),
    [store, tableId, rowId, has],
  );
  const [newId, setNewId] = useState<Id>(cloneId);
  const [newIdOk, setNewIdOk] = useState<boolean>(true);
  const [previousClone, setPreviousClone] = useState<() => Id>(() => cloneId);
  const handleNewIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewId(e.target.value);
    setNewIdOk(!has(e.target.value));
  };
  const handleAddCell = useCallback(() => {
    if (has(newId)) {
      setNewIdOk(false);
    } else {
      store.setCell(tableId, rowId, newId, '');
      onDone();
    }
  }, [onDone, setNewIdOk, has, store, newId, tableId, rowId]);
  if (cloneId != previousClone) {
    setNewId(cloneId);
    setPreviousClone(cloneId);
  }
  return (
    <>
      {'New Id: '}
      <input type="text" value={newId} onChange={handleNewIdChange} />{' '}
      <img
        onClick={handleAddCell}
        title={newIdOk ? 'Add Cell' : 'Id already exists'}
        className={newIdOk ? 'ok' : 'okDis'}
      />
    </>
  );
};

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
      ['addCell', 'Add Cell', RowAddCell],
      ['clone', 'Clone Row', RowClone],
      ['delete', 'Delete Row', RowDelete],
    ]}
    store={store}
    tableId={tableId}
    rowId={rowId}
  />
);
export const rowActions = [{label: '', component: RowActions}];
