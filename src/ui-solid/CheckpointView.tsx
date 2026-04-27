/* @jsxImportSource solid-js */
import type {
  CheckpointProps,
} from '../@types/ui-solid/index.d.ts';
import {getValue} from '../common/solid.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {wrap} from './common/wrap.tsx';
import {useCheckpoint} from './hooks.ts';

export const CheckpointView = (props: CheckpointProps): any => {
  const checkpoint = useCheckpoint(
    (() => props.checkpointId) as any,
    (() => props.checkpoints) as any,
  ) as any;
  return () =>
    wrap(
      (getValue(checkpoint) as any) ?? EMPTY_STRING,
      undefined,
      props.debugIds,
      props.checkpointId,
    );
};
