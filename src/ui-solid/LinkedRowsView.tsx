/* @jsxImportSource solid-js */
import type {
  LinkedRowsProps,
} from '../@types/ui-solid/index.d.ts';
import {useComponentPerRow} from './common/index.tsx';
import {useLinkedRowIds} from './hooks.ts';

export const LinkedRowsView = (
  props: LinkedRowsProps,
): any => useComponentPerRow(props as any, useLinkedRowIds as any, props.firstRowId);
