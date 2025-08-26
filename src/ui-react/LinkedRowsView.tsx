import type {
  LinkedRowsProps,
  LinkedRowsView as LinkedRowsViewDecl,
} from '../@types/ui-react/index.js';
import {useComponentPerRow} from './common.tsx';
import {useLinkedRowIds} from './hooks.ts';

export const LinkedRowsView: typeof LinkedRowsViewDecl = (
  props: LinkedRowsProps,
): any => useComponentPerRow(props, useLinkedRowIds, props.firstRowId);
