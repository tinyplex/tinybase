import type {Id} from '../../@types/index.d.ts';
import type {
  StoreOrStoreId,
  ValueProps,
  ValuesProps,
} from '../../@types/ui-react/index.d.ts';
import {useCallback} from '../../common/react.ts';
import {
  useDelValueCallback,
  useDelValuesCallback,
  useHasValues,
  useSetValueCallback,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {
  Actions,
  ConfirmableActions,
  Delete,
  getNewIdFromSuggestedId,
  NewId,
  type OnDoneProp,
} from './common.tsx';

const useHasValueCallback = (storeOrStoreId: StoreOrStoreId | undefined) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (valueId: Id) => store?.hasValue(valueId) ?? false,
    [store],
  );
};

const AddValue = ({onDone, store}: OnDoneProp & ValuesProps) => {
  const has = useHasValueCallback(store);
  return (
    <NewId
      onDone={onDone}
      suggestedId={getNewIdFromSuggestedId('value', has)}
      has={has}
      set={useSetValueCallback(
        (newId: Id) => newId,
        () => '',
        [],
        store,
      )}
      prompt="Add value"
    />
  );
};

const DeleteValues = ({onDone, store}: OnDoneProp & ValuesProps) => (
  <Delete
    onClick={useDelValuesCallback(store, onDone)}
    prompt="Delete all values"
  />
);

export const ValuesActions = ({store}: ValuesProps) => (
  <Actions
    left={
      <ConfirmableActions
        actions={[['add', 'Add value', AddValue]]}
        store={store}
      />
    }
    right={
      useHasValues(store) ? (
        <ConfirmableActions
          actions={[['delete', 'Delete all values', DeleteValues]]}
          store={store}
        />
      ) : null
    }
  />
);

// --

const CloneValue = ({onDone, valueId, store}: OnDoneProp & ValueProps) => {
  const has = useHasValueCallback(store);
  return (
    <NewId
      onDone={onDone}
      suggestedId={getNewIdFromSuggestedId(valueId, has)}
      has={has}
      set={useSetValueCallback(
        (newId: Id) => newId,
        (_, store) => store.getValue(valueId) ?? '',
        [valueId],
        store,
      )}
      prompt="Clone value to"
    />
  );
};

const DeleteValue = ({onDone, valueId, store}: OnDoneProp & ValueProps) => (
  <Delete
    onClick={useDelValueCallback(valueId, store, onDone)}
    prompt="Delete value"
  />
);

export const ValueActions = ({valueId, store}: ValueProps) => (
  <ConfirmableActions
    actions={[
      ['clone', 'Clone value', CloneValue],
      ['delete', 'Delete value', DeleteValue],
    ]}
    store={store}
    valueId={valueId}
  />
);
