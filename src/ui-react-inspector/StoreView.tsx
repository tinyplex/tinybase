import type {Id} from '../@types/common/index.d.ts';
import {isUndefined} from '../common/other.ts';
import {DEFAULT} from '../common/strings.ts';
import {useStore} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {TablesView} from './TablesView.tsx';
import {ValuesView} from './ValuesView.tsx';
import {getUniqueId} from './common.ts';
import type {StoreProp} from './types.ts';

export const StoreView = ({
  storeId,
  s,
}: {readonly storeId?: Id} & StoreProp) => {
  const store = useStore(storeId);
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
      <TablesView storeId={storeId} store={store} s={s} />
    </Details>
  );
};
