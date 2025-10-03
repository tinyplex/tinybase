import type {
  LinkedRowsProps,
  LinkedRowsView as LinkedRowsViewDecl,
} from '../@types/ui-react/index.d.ts';
import {useComponentPerRow} from './common/index.tsx';
import {useLinkedRowIds} from './hooks.ts';

export const LinkedRowsView: typeof LinkedRowsViewDecl = (
  props: LinkedRowsProps,
): any => useComponentPerRow(props, useLinkedRowIds, props.firstRowId);
