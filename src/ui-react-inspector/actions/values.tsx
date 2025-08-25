import type {Id} from '../../@types/index.js';
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
} from './common.tsx';

const useHasValueCallback = (storeOrStoreId: StoreOrStoreId | undefined) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return useCallback(
    (valueId: Id) => store?.hasValue(valueId) ?? false,
    [store],
  );
};

const AddValue = ({onDone, store}: {onDone: () => void} & ValuesProps) => {
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
    />
  );
};

const DeleteValues = ({onDone, store}: {onDone: () => void} & ValuesProps) => (
  <Delete onClick={useDelValuesCallback(store, onDone)} />
);

export const ValuesActions = ({store}: ValuesProps) => (
  <Actions
    left={
      <ConfirmableActions
        actions={[['add', 'Add Value', AddValue]]}
        store={store}
      />
    }
    right={
      useHasValues(store) ? (
        <ConfirmableActions
          actions={[['delete', 'Delete all Values', DeleteValues]]}
          store={store}
        />
      ) : null
    }
  />
);

// --

const CloneValue = ({
  onDone,
  valueId,
  store,
}: {onDone: () => void} & ValueProps) => {
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
    />
  );
};

const DeleteValue = ({
  onDone,
  valueId,
  store,
}: {onDone: () => void} & ValueProps) => (
  <Delete onClick={useDelValueCallback(valueId, store, onDone)} />
);

export const ValueActions = ({valueId, store}: ValueProps) => (
  <ConfirmableActions
    actions={[
      ['clone', 'Clone Value', CloneValue],
      ['delete', 'Delete Value', DeleteValue],
    ]}
    store={store}
    valueId={valueId}
  />
);
