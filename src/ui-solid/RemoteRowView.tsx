/* @jsxImportSource solid-js */
import type {Id} from '../@types/index.d.ts';
import type {
  RemoteRowProps,
} from '../@types/ui-solid/index.d.ts';
import {isUndefined} from '../common/other.ts';
import {
  getProps,
  getRelationshipsStoreTableIds,
  getValue,
} from '../common/solid.ts';
import {wrap} from './common/wrap.tsx';
import {useRelationshipsOrRelationshipsById, useRemoteRowId} from './hooks.ts';
import {RowView} from './RowView.tsx';

export const RemoteRowView = (props: RemoteRowProps): any => {
  const resolvedRelationships =
    useRelationshipsOrRelationshipsById((() => props.relationships) as any);
  const rowId = useRemoteRowId(
    (() => props.relationshipId) as any,
    (() => props.localRowId) as any,
    resolvedRelationships as any,
  ) as any;
  return () => {
    const Row = props.rowComponent ?? RowView;
    const [_relationshipsValue, store, , remoteTableId] =
      getRelationshipsStoreTableIds(
        getValue(resolvedRelationships as any),
        props.relationshipId,
      );
    const remoteRowId = getValue(rowId) as Id | undefined;
    return wrap(
      isUndefined(remoteTableId) || isUndefined(remoteRowId) ? null : (
        <Row
          {...getProps(props.getRowComponentProps, remoteRowId as Id)}
          tableId={remoteTableId}
          rowId={remoteRowId}
          store={store}
          debugIds={props.debugIds}
        />
      ),
      undefined,
      props.debugIds,
      props.localRowId,
    );
  };
};
