import type {Value} from '../@types/index.js';
import type {EditableValueView as EditableValueViewDecl} from '../@types/ui-react-dom/index.js';
import type {ValueProps} from '../@types/ui-react/index.js';
import {VALUE} from '../common/strings.ts';
import {
  useSetValueCallback,
  useStoreOrStoreById,
  useValue,
} from '../ui-react/hooks.ts';
import {EditableThing} from './common/components.tsx';
import {EDITABLE} from './common/index.tsx';

export const EditableValueView: typeof EditableValueViewDecl = ({
  valueId,
  store,
  className,
  showType,
}: ValueProps & {readonly className?: string; readonly showType?: boolean}) => (
  <EditableThing
    thing={useValue(valueId, store)}
    onThingChange={useSetValueCallback(
      valueId,
      (value: Value) => value,
      [],
      store,
    )}
    className={className ?? EDITABLE + VALUE}
    showType={showType}
    hasSchema={useStoreOrStoreById(store)?.hasValuesSchema}
  />
);
