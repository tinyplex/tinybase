import type {EditableValueView as EditableValueViewDecl} from '../@types/ui-react-dom/index.d.ts';
import type {ValueProps} from '../@types/ui-react/index.d.ts';
import {VALUE} from '../common/strings.ts';
import {useStoreOrStoreById, useValueState} from '../ui-react/hooks.ts';
import {EditableThing} from './common/components.tsx';
import {EDITABLE} from './common/index.tsx';

export const EditableValueView: typeof EditableValueViewDecl = ({
  valueId,
  store,
  className,
  showType,
}: ValueProps & {readonly className?: string; readonly showType?: boolean}) => {
  const [value, setValue] = useValueState(valueId, store);
  return (
    <EditableThing
      thing={value}
      onThingChange={setValue}
      className={className ?? EDITABLE + VALUE}
      showType={showType}
      hasSchema={useStoreOrStoreById(store)?.hasValuesSchema}
    />
  );
};
