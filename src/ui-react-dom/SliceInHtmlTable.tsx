import type {Id} from '../@types/index.js';
import type {
  HtmlTableProps,
  SliceInHtmlTable as SliceInHtmlTableDecl,
  SliceInHtmlTableProps,
} from '../@types/ui-react-dom/index.js';
import {getIndexStoreTableId} from '../common/react.ts';
import {
  useIndexesOrIndexesById,
  useSliceRowIds,
  useTableCellIds,
} from '../ui-react/hooks.ts';
import {CellView} from '../ui-react/index.ts';
import {HtmlTable} from './common/components.tsx';
import {
  useCells,
  useParams,
  useStoreCellComponentProps,
} from './common/hooks.tsx';
import {EditableCellView} from './EditableCellView.tsx';

export const SliceInHtmlTable: typeof SliceInHtmlTableDecl = ({
  indexId,
  sliceId,
  indexes,
  editable,
  customCells,
  extraCellsBefore,
  extraCellsAfter,
  ...props
}: SliceInHtmlTableProps & HtmlTableProps): any => {
  const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
    useIndexesOrIndexesById(indexes),
    indexId,
  );
  return (
    <HtmlTable
      {...props}
      params={useParams(
        useCells(
          useTableCellIds(tableId as Id, store),
          customCells,
          editable ? EditableCellView : CellView,
        ),
        useStoreCellComponentProps(store, tableId as Id),
        useSliceRowIds(indexId, sliceId, resolvedIndexes),
        extraCellsBefore,
        extraCellsAfter,
      )}
    />
  );
};
