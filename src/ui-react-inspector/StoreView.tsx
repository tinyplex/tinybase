import type {Id} from '../@types/common/index.d.ts';
import {isUndefined} from '../common/other.ts';
import {DEFAULT} from '../common/strings.ts';
import {useStore, useTableIds} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {TableView} from './TableView.tsx';
import {ValuesView} from './ValuesView.tsx';
import {getUniqueId, sortedIdsMap} from './common.ts';
import type {StoreProp} from './types.ts';

export const StoreView = ({
  storeId,
  s,
}: {readonly storeId?: Id} & StoreProp) => {
  const store = useStore(storeId);
  const tableIds = useTableIds(store);
  return isUndefined(store) ? null : (
    <Details
      uniqueId={getUniqueId('s', storeId)}
      title={
        (store.isMergeable() ? 'Mergeable' : '') +
        'Store: ' +
        (storeId ?? DEFAULT)
      }
      s={s}
    >
      <ValuesView storeId={storeId} store={store} s={s} />
      {sortedIdsMap(tableIds, (tableId) => (
        <TableView
          store={store}
          storeId={storeId}
          tableId={tableId}
          s={s}
          key={tableId}
        />
      ))}
    </Details>
  );
};
