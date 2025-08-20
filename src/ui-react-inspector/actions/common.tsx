import type {ComponentType} from 'react';
import type {Id} from '../../@types/common/index.d.ts';
import type {RowProps, ValueProps} from '../../@types/ui-react/index.d.ts';
import {useCallback, useState} from '../../common/react.ts';

export const clonedId = (oldId: Id, exists: (newId: Id) => boolean) => {
  let newId;
  let suffix = 1;
  while (
    exists((newId = oldId + ' (copy' + (suffix > 1 ? ' ' + suffix : '') + ')'))
  ) {
    suffix++;
  }
  return newId;
};

export const ConfirmableActions = <Props extends RowProps | ValueProps>({
  actions,
  ...props
}: {
  actions: [
    icon: string,
    title: string,
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
    return actions.map(([icon, title], index) => (
      <img
        key={index}
        title={title}
        className={icon}
        onClick={() => setConfirming(index)}
      />
    ));
  }
};

export const Clone = ({
  onDone,
  id,
  has,
  set,
}: {
  onDone: () => void;
  id: Id;
  has: (id: Id) => boolean;
  set: (newId: Id) => void;
}) => {
  const clone = useCallback(() => clonedId(id, has), [id, has]);
  const [newId, setNewId] = useState<Id>(clone);
  const [newIdOk, setNewIdOk] = useState<boolean>(true);
  const [previousClone, setPreviousClone] = useState<() => Id>(() => clone);
  const handleNewIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewId(e.target.value);
    setNewIdOk(!has(e.target.value));
  };
  const handleClone = useCallback(() => {
    if (has(newId)) {
      setNewIdOk(false);
    } else {
      set(newId);
      onDone();
    }
  }, [onDone, setNewIdOk, has, set, newId]);
  if (clone != previousClone) {
    setNewId(clone);
    setPreviousClone(clone);
  }
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

export const Delete = ({onClick}: {onClick: () => void}) => (
  <>
    Delete? <img onClick={onClick} title="Confirm" className="ok" />
  </>
);
