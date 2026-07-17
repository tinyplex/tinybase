import type {ComponentType, ReactNode} from 'react';
import type {Id} from '../../@types/common/index.d.ts';
import type {
  CellProps,
  RowProps,
  TableProps,
  ValueProps,
  ValuesProps,
} from '../../@types/ui-react/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {addEventListener, isUndefined} from '../../common/other.ts';
import {useCallback, useEffect, useState} from '../../common/react.ts';
import {KEYDOWN} from '../../common/strings.ts';

export type OnDoneProp = {readonly onDone: () => void};

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
  readonly actions: [
    icon: string,
    title: string,
    component: ComponentType<OnDoneProp & Props>,
  ][];
} & Props) => {
  const [confirming, setConfirming] = useState<number | undefined>();
  const handleDone = useCallback(() => setConfirming(undefined), []);

  useEffect(() => {
    if (!isUndefined(confirming)) {
      return addEventListener(document, KEYDOWN, (event: KeyboardEvent) => {
        if (!isUndefined(confirming) && event.key === 'Escape') {
          event.preventDefault();
          handleDone();
        }
      });
    }
  }, [confirming, handleDone]);

  if (!isUndefined(confirming)) {
    const [, , Component] = actions[confirming];
    return (
      <>
        <Component onDone={handleDone} {...(props as any)} />
        <img onClick={handleDone} title="Cancel" className="cancel" />
      </>
    );
  } else {
    return arrayMap(actions, ([icon, title], index) => (
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
}: OnDoneProp & {
  readonly suggestedId: Id;
  readonly has: (id: Id) => boolean;
  readonly set: (newId: Id) => void;
  readonly prompt?: string;
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
  readonly onClick: () => void;
  readonly prompt?: string;
}) => {
  useEffect(
    () =>
      addEventListener(document, KEYDOWN, (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onClick();
        }
      }),
    [onClick],
  );

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
  readonly left?: ReactNode;
  readonly right?: ReactNode;
}) => (
  <div className="actions">
    <div>{left}</div>
    <div>{right}</div>
  </div>
);
