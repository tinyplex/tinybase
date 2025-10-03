import type {Id} from '../@types/index.d.ts';
import type {
  SliceProps,
  SliceView as SliceViewDecl,
} from '../@types/ui-react/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getIndexStoreTableId, getProps} from '../common/react.ts';
import {wrap} from './common/wrap.tsx';
import {useIndexesOrIndexesById, useSliceRowIds} from './hooks.ts';
import {RowView} from './RowView.tsx';

export const SliceView: typeof SliceViewDecl = ({
  indexId,
  sliceId,
  indexes,
  rowComponent: Row = RowView,
  getRowComponentProps,
  separator,
  debugIds,
}: SliceProps): any => {
  const [resolvedIndexes, store, tableId] = getIndexStoreTableId(
    useIndexesOrIndexesById(indexes),
    indexId,
  );
  const rowIds = useSliceRowIds(indexId, sliceId, resolvedIndexes);
  return wrap(
    arrayMap(rowIds, (rowId) => (
      <Row
        key={rowId}
        {...getProps(getRowComponentProps, rowId)}
        tableId={tableId as Id}
        rowId={rowId}
        store={store}
        debugIds={debugIds}
      />
    )),
    separator,
    debugIds,
    sliceId,
  );
};
