import type {
  LocalRowsProps,
  LocalRowsView as LocalRowsViewDecl,
} from '../@types/ui-react/index.js';
import {useComponentPerRow} from './common/index.tsx';
import {useLocalRowIds} from './hooks.ts';

export const LocalRowsView: typeof LocalRowsViewDecl = (
  props: LocalRowsProps,
): any => useComponentPerRow(props, useLocalRowIds, props.remoteRowId);
