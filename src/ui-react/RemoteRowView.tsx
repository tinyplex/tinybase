import type {Id} from '../@types/index.js';
import type {
  RemoteRowProps,
  RemoteRowView as RemoteRowViewDecl,
} from '../@types/ui-react/index.js';
import {isUndefined} from '../common/other.ts';
import {getProps, getRelationshipsStoreTableIds} from '../common/react.ts';
import {wrap} from './common.tsx';
import {useRelationshipsOrRelationshipsById, useRemoteRowId} from './hooks.ts';
import {RowView} from './RowView.tsx';

export const RemoteRowView: typeof RemoteRowViewDecl = ({
  relationshipId,
  localRowId,
  relationships,
  rowComponent: Row = RowView,
  getRowComponentProps,
  debugIds,
}: RemoteRowProps): any => {
  const [resolvedRelationships, store, , remoteTableId] =
    getRelationshipsStoreTableIds(
      useRelationshipsOrRelationshipsById(relationships),
      relationshipId,
    );
  const rowId = useRemoteRowId(
    relationshipId,
    localRowId,
    resolvedRelationships,
  );
  return wrap(
    isUndefined(remoteTableId) || isUndefined(rowId) ? null : (
      <Row
        key={rowId}
        {...getProps(getRowComponentProps, rowId as Id)}
        tableId={remoteTableId}
        rowId={rowId}
        store={store}
        debugIds={debugIds}
      />
    ),
    undefined,
    debugIds,
    localRowId,
  );
};
