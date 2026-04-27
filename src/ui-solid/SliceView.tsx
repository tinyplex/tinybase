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

export const SliceView = (props: SliceProps): any => {
  const resolvedIndexes = useIndexesOrIndexesById(
    (() => props.indexes) as any,
  );
  const rowIds = useSliceRowIds(
    (() => props.indexId) as any,
    (() => props.sliceId) as any,
    resolvedIndexes as any,
  ) as any;
  return () => {
    const Row = props.rowComponent ?? RowView;
    const [_indexesValue, store, tableId] = getIndexStoreTableId(
      getValue(resolvedIndexes as any),
      props.indexId,
    );
    return wrap(
      arrayMap(getValue(rowIds) as Id[], (rowId) => (
        <Row
          {...getProps(props.getRowComponentProps, rowId)}
          tableId={tableId as Id}
          rowId={rowId}
          store={store}
          debugIds={props.debugIds}
        />
      )),
      props.separator,
      props.debugIds,
      props.sliceId,
    );
  };
};
