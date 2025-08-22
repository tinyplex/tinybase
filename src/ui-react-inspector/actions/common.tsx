import type {ComponentType} from 'react';
import type {Id} from '../../@types/common/index.d.ts';
import type {
  CellProps,
  RowProps,
  StoreOrStoreId,
  ValueProps,
} from '../../@types/ui-react/index.d.ts';
import {useCallback, useState} from '../../common/react.ts';

export const getNewIdFromSuggestedId = (
  suggestedId: Id,
  has: (newId: Id) => boolean,
) => {
  let newId;
  let suffix = 0;
  while (
    has(
      (newId =
        suggestedId +
        (suffix > 0 ? ' (copy' + (suffix > 1 ? ' ' + suffix : '') + ')' : '')),
    )
  ) {
    suffix++;
  }
  return newId;
};

export const ConfirmableActions = <
  Props extends
    | RowProps
    | CellProps
    | ValueProps
    | {readonly store?: StoreOrStoreId | undefined},
>({
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
    const [, , Component] = actions[confirming];
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

export const NewId = ({
  onDone,
  suggestedId,
  has,
  set,
}: {
  onDone: () => void;
  suggestedId: Id;
  has: (id: Id) => boolean;
  set: (newId: Id) => void;
}) => {
  const [newId, setNewId] = useState<Id>(suggestedId);
  const [newIdOk, setNewIdOk] = useState<boolean>(true);
  const [previousSuggestedId, setPreviousSuggestedNewId] =
    useState<Id>(suggestedId);
  const handleNewIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewId(e.target.value);
    setNewIdOk(!has(e.target.value));
  };
  const handleClick = useCallback(() => {
    if (has(newId)) {
      setNewIdOk(false);
    } else {
      set(newId);
      onDone();
    }
  }, [onDone, setNewIdOk, has, set, newId]);
  if (suggestedId != previousSuggestedId) {
    setNewId(suggestedId);
    setPreviousSuggestedNewId(suggestedId);
  }
  return (
    <>
      {'New Id: '}
      <input type="text" value={newId} onChange={handleNewIdChange} />{' '}
      <img
        onClick={handleClick}
        title={newIdOk ? 'Confirm' : 'Id already exists'}
        className={newIdOk ? 'ok' : 'okDis'}
      />
    </>
  );
};

export const Delete = ({onClick}: {onClick: () => void}) => (
  <>
    Delete? <img onClick={onClick} title="Confirm" className="ok" />
  </>
);
