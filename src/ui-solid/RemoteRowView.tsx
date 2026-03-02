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

export const RemoteRowView = ({
  relationshipId,
  localRowId,
  relationships,
  rowComponent: Row = RowView,
  getRowComponentProps,
  debugIds,
}: RemoteRowProps): any => {
  const resolvedRelationships =
    useRelationshipsOrRelationshipsById(relationships);
  const rowId = useRemoteRowId(
    relationshipId,
    localRowId,
    resolvedRelationships as any,
  ) as any;
  return () => {
    const [_relationshipsValue, store, , remoteTableId] =
      getRelationshipsStoreTableIds(
        getValue(resolvedRelationships as any),
        relationshipId,
      );
    const remoteRowId = getValue(rowId) as Id | undefined;
    return wrap(
      isUndefined(remoteTableId) || isUndefined(remoteRowId) ? null : (
        <Row
          {...getProps(getRowComponentProps, remoteRowId as Id)}
          tableId={remoteTableId}
          rowId={remoteRowId}
          store={store}
          debugIds={debugIds}
        />
      ),
      undefined,
      debugIds,
      localRowId,
    );
  };
};
