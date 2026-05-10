/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import {createMemo} from 'solid-js';
import type {Id} from '../@types/index.d.ts';
import type {
  HtmlTableProps,
  SliceInHtmlTable as SliceInHtmlTableDecl,
  SliceInHtmlTableProps,
} from '../@types/ui-solid-dom/index.d.ts';
import {getIndexStoreTableId} from '../common/solid.ts';
import {CellView} from '../ui-solid/index.ts';
import {
  useIndexesOrIndexesById,
  useSliceRowIds,
  useTableCellIds,
} from '../ui-solid/primitives.ts';
import {HtmlTable} from './common/components.tsx';
import {
  getParams,
  getStoreCellComponentProps,
  useCells,
} from './common/hooks.tsx';
import {EditableCellView} from './EditableCellView.tsx';

export const SliceInHtmlTable: typeof SliceInHtmlTableDecl = (
  props: SliceInHtmlTableProps & HtmlTableProps,
): JSXElement => {
  const resolvedIndexes = useIndexesOrIndexesById(() => props.indexes);
  const details = createMemo(() =>
    getIndexStoreTableId(resolvedIndexes(), props.indexId),
  );
  return (
    <HtmlTable
      {...props}
      params={getParams(
        useCells(
          useTableCellIds(
            () => details()[2] as Id,
            () => details()[1],
          ),
          props.customCells,
          props.editable ? EditableCellView : CellView,
        ),
        getStoreCellComponentProps(details()[1], details()[2] as Id),
        useSliceRowIds(
          () => props.indexId,
          () => props.sliceId,
          resolvedIndexes,
        ),
        props.extraCellsBefore,
        props.extraCellsAfter,
      )}
    />
  );
};
