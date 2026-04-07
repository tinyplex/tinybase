import type {Id} from '../@types/common/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import type {MaybeGetter} from '../@types/ui-svelte/index.d.ts';
import {EDITABLE_CELL, STATE_TABLE} from '../common/inspector/common.ts';
import {isFunction} from '../common/other.ts';
import {getCell} from '../ui-svelte/functions.svelte.ts';

const maybeGet = <Value>(value: MaybeGetter<Value>): Value =>
  isFunction(value) ? value() : value;

export const useEditable = (
  uniqueId: MaybeGetter<Id>,
  s: MaybeGetter<Store>,
) => {
  const editable = getCell(
    () => STATE_TABLE,
    () => maybeGet(uniqueId),
    () => EDITABLE_CELL,
    () => maybeGet(s),
  );
  const handleEditable = (event?: Event) => {
    editable.current = !editable.current;
    event?.preventDefault();
  };
  return [editable, handleEditable] as const;
};
