import type {Id} from '../../@types/index.d.ts';
import type {ValueProps} from '../../@types/ui-react/index.d.ts';
import {useCallback} from '../../common/react.ts';
import {
  useDelValueCallback,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {Clone, ConfirmableActions, Delete} from './common.tsx';

const ValueClone = ({
  onDone,
  valueId,
  store: storeOrId,
}: {onDone: () => void} & ValueProps) => {
  const store = useStoreOrStoreById(storeOrId)!;
  const has = useCallback((valueId: Id) => store.hasValue(valueId), [store]);
  const set = useCallback(
    (newId: Id) => store.setValue(newId, store.getValue(valueId)!),
    [store, valueId],
  );
  return <Clone onDone={onDone} id={valueId} has={has} set={set} />;
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
