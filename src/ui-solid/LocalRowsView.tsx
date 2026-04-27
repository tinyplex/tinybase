/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {LocalRowsProps} from '../@types/ui-solid/index.d.ts';
import {useComponentPerRow} from './common/index.tsx';
import {useLocalRowIds} from './primitives.ts';

export const LocalRowsView = (props: LocalRowsProps): JSXElement =>
  useComponentPerRow(props, useLocalRowIds, () => props.remoteRowId);
