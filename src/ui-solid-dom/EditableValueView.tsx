/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {EditableValueView as EditableValueViewDecl} from '../@types/ui-solid-dom/index.d.ts';
import type {ValueProps} from '../@types/ui-solid/index.d.ts';
import {VALUE} from '../common/strings.ts';
import {useStoreOrStoreById, useValueState} from '../ui-solid/primitives.ts';
import {EditableThing} from './common/components.tsx';
import {EDITABLE} from './common/index.tsx';

export const EditableValueView: typeof EditableValueViewDecl = (
  props: ValueProps & {
    readonly className?: string;
    readonly showType?: boolean;
  },
): JSXElement => {
  const [value, setValue] = useValueState(
    () => props.valueId,
    () => props.store,
  );
  const store = useStoreOrStoreById(() => props.store);
  return (
    <EditableThing
      thing={value()}
      onThingChange={setValue}
      class={props.className ?? EDITABLE + VALUE}
      showType={props.showType}
      hasSchema={() => !!store()?.hasValuesSchema()}
    />
  );
};
