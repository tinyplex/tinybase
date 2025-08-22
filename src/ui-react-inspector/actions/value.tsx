import type {Id} from '../../@types/index.d.ts';
import type {
  StoreOrStoreId,
  ValueProps,
} from '../../@types/ui-react/index.d.ts';
import {useCallback} from '../../common/react.ts';
import {
  useDelValueCallback,
  useSetValueCallback,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {
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

export const ValueAdd = ({
  onDone,
  store,
}: {onDone: () => void} & {readonly store?: StoreOrStoreId | undefined}) => (
  <NewId
    onDone={onDone}
    suggestedId="value"
    has={useHasValueCallback(store)}
    set={useSetValueCallback(
      (newId: Id) => newId,
      () => '',
      [],
      store,
    )}
  />
);

const ValueClone = ({
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

const ValueDelete = ({
  onDone,
  valueId,
  store,
}: {onDone: () => void} & ValueProps) => (
  <Delete onClick={useDelValueCallback(valueId, store, onDone)} />
);

const ValueActions = ({valueId, store}: ValueProps) => (
  <ConfirmableActions
    actions={[
      ['clone', 'Clone Value', ValueClone],
      ['delete', 'Delete Value', ValueDelete],
    ]}
    store={store}
    valueId={valueId}
  />
);

export const valueActions = [{label: '', component: ValueActions}];
