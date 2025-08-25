import type {ComponentType, ReactNode} from 'react';
import type {Id} from '../../@types/common/index.d.ts';
import type {
  CellProps,
  RowProps,
  TableProps,
  ValueProps,
  ValuesProps,
} from '../../@types/ui-react/index.d.ts';
import {useCallback, useEffect, useState} from '../../common/react.ts';

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
  Props extends TableProps | RowProps | CellProps | ValuesProps | ValueProps,
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

  useEffect(() => {
    if (confirming != null) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (confirming != null && e.key === 'Escape') {
          e.preventDefault();
          handleDone();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [confirming, handleDone]);

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
  prompt = 'New Id',
}: {
  onDone: () => void;
  suggestedId: Id;
  has: (id: Id) => boolean;
  set: (newId: Id) => void;
  prompt?: string;
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  if (suggestedId != previousSuggestedId) {
    setNewId(suggestedId);
    setPreviousSuggestedNewId(suggestedId);
  }
  return (
    <>
      {prompt + ': '}
      <input
        type="text"
        value={newId}
        onChange={handleNewIdChange}
        onKeyDown={handleKeyDown}
        autoFocus
      />{' '}
      <img
        onClick={handleClick}
        title={newIdOk ? 'Confirm' : 'Id already exists'}
        className={newIdOk ? 'ok' : 'okDis'}
      />
    </>
  );
};

export const Delete = ({
  onClick,
  prompt = 'Delete',
}: {
  onClick: () => void;
  prompt?: string;
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {prompt}? <img onClick={onClick} title="Confirm" className="ok" />
    </>
  );
};

export const Actions = ({
  left,
  right,
}: {
  left?: ReactNode;
  right?: ReactNode;
}) => (
  <div className="actions">
    <div>{left}</div>
    <div>{right}</div>
  </div>
);
