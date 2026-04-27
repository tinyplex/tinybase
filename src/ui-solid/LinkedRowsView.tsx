/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {LinkedRowsProps} from '../@types/ui-solid/index.d.ts';
import {useComponentPerRow} from './common/index.tsx';
import {useLinkedRowIds} from './primitives.ts';

export const LinkedRowsView = (props: LinkedRowsProps): JSXElement =>
  useComponentPerRow(props, useLinkedRowIds, () => props.firstRowId);
