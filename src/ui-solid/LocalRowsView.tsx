/* @jsxImportSource solid-js */
import type {
  LocalRowsProps,
} from '../@types/ui-solid/index.d.ts';
import {useComponentPerRow} from './common/index.tsx';
import {useLocalRowIds} from './hooks.ts';

export const LocalRowsView = (
  props: LocalRowsProps,
): any => useComponentPerRow(props as any, useLocalRowIds as any, props.remoteRowId);
