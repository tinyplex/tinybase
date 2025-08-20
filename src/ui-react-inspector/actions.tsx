import type {ComponentType} from 'react';
import type {Id} from '../@types/common/index.d.ts';
import type {RowProps, ValueProps} from '../@types/ui-react/index.d.ts';
import {useCallback, useState} from '../common/react.ts';
import {
  useDelRowCallback,
  useDelValueCallback,
  useSetValueCallback,
  useStoreOrStoreById,
} from '../ui-react/index.ts';

const clonedId = (oldId: Id, exists: (newId: Id) => boolean) => {
  let newId;
  let suffix = 1;
  while (
    exists((newId = oldId + ' (copy' + (suffix > 1 ? ' ' + suffix : '') + ')'))
  ) {
    suffix++;
  }
  return newId;
};

const Delete = ({onDelete}: {onDelete: () => void}) => {
  const [confirming, setConfirming] = useState(false);
  const handleConfirm = useCallback(() => setConfirming(true), []);
  const handleDelete = useCallback(() => {
    onDelete();
    setConfirming(false);
  }, [onDelete]);
  const handleCancel = useCallback(() => setConfirming(false), []);
  return confirming ? (
    <>
      Delete? <img onClick={handleDelete} className="ok" />
      <img onClick={handleCancel} className="cancel" />
    </>
  ) : (
    <img onClick={handleConfirm} title="Delete" className="delete" />
  );
};

const ConfirmableActions = <Props extends RowProps | ValueProps>({
  actions,
  ...props
}: {
  actions: [
    icon: string,
    component: ComponentType<{onDone: () => void} & Props>,
  ][];
} & Props) => {
  const [confirming, setConfirming] = useState<number | null>();
  const handleDone = useCallback(() => setConfirming(null), []);
  if (confirming != null) {
    const [, Component] = actions[confirming];
    return (
      <>
        <Component onDone={handleDone} {...(props as any)} />
        <img onClick={handleDone} title="Cancel" className="cancel" />
      </>
    );
  } else {
    return actions.map(([icon], index) => (
      <img key={index} className={icon} onClick={() => setConfirming(index)} />
    ));
  }
};

const RowClone = ({
  onDone,
  tableId,
  rowId,
  store: storeOrId,
}: {onDone: () => void} & RowProps) => {
  const store = useStoreOrStoreById(storeOrId)!;
  const [newId, setNewId] = useState<string>(() =>
    clonedId(rowId, (rowId) => store.hasRow(tableId, rowId)),
  );
  const [newIdOk, setNewIdOk] = useState<boolean>(true);
  const handleNewIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewId(e.target.value);
    setNewIdOk(!store.hasRow(tableId, e.target.value));
  };
  const handleClone = useCallback(() => {
    if (store.hasRow(tableId, newId)) {
      setNewIdOk(false);
    } else {
      store.setRow(tableId, newId!, store.getRow(tableId, rowId));
      onDone();
    }
  }, [onDone, store, tableId, rowId, newId]);
  return (
    <>
      {'Clone to Id: '}
      <input type="text" value={newId} onChange={handleNewIdChange} />{' '}
      <img
        onClick={handleClone}
        title={newIdOk ? 'Clone' : 'Id already exists'}
        className={newIdOk ? 'ok' : 'ok-dis'}
      />
    </>
  );
};

const RowDelete = ({
  onDone,
  tableId,
  rowId,
  store,
}: {onDone: () => void} & RowProps) => (
  <>
    Delete?{' '}
    <img
      onClick={useDelRowCallback(tableId, rowId, store, onDone)}
      title="Confirm"
      className="ok"
    />
  </>
);
const RowActions = ({tableId, rowId, store}: RowProps) => {
  return (
    <ConfirmableActions
      actions={[
        ['clone', RowClone],
        ['delete', RowDelete],
      ]}
      store={store}
      tableId={tableId}
      rowId={rowId}
    />
  );
};

export const rowActions = [{label: '', component: RowActions}];

const ValueActions = ({valueId, store}: ValueProps) => {
  const handleClone = useSetValueCallback(
    (_, store) => clonedId(valueId, store.hasValue),
    (_, store) => store.getValue(valueId)!,
  );
  const handleDelete = useDelValueCallback(valueId, store);
  return (
    <>
      <img onClick={handleClone} title="Clone Value" className="clone" />
      <Delete onDelete={handleDelete} />
    </>
  );
};
export const valueActions = [{label: '', component: ValueActions}];
