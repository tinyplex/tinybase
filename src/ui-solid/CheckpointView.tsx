/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {CheckpointProps} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useCheckpoint} from './primitives.ts';

export const CheckpointView = (props: CheckpointProps): JSXElement => {
  const checkpoint = useCheckpoint(
    () => props.checkpointId,
    () => props.checkpoints,
  );
  // eslint-disable-next-line solid/reactivity
  return (() =>
    wrap(
      getValue(checkpoint) ?? EMPTY_STRING,
      undefined,
      props.debugIds,
      props.checkpointId,
    )) as unknown as JSXElement;
};
