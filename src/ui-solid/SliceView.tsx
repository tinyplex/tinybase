/* @jsxImportSource solid-js */
import type {Id} from '../@types/index.d.ts';
import type {
  SliceProps,
} from '../@types/ui-solid/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getIndexStoreTableId, getProps, getValue} from '../common/solid.ts';
import {wrap} from './common/wrap.tsx';
import {useIndexesOrIndexesById, useSliceRowIds} from './hooks.ts';
import {RowView} from './RowView.tsx';

export const SliceView = ({
  indexId,
  sliceId,
  indexes,
  rowComponent: Row = RowView,
  getRowComponentProps,
  separator,
  debugIds,
}: SliceProps): any => {
  const resolvedIndexes = useIndexesOrIndexesById(indexes);
  const rowIds = useSliceRowIds(indexId, sliceId, resolvedIndexes as any) as any;
  return () => {
    const [_indexesValue, store, tableId] = getIndexStoreTableId(
      getValue(resolvedIndexes as any),
      indexId,
    );
    return wrap(
      arrayMap(getValue(rowIds) as Id[], (rowId) => (
        <Row
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
};
