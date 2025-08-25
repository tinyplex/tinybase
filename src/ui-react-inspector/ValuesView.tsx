import type {Id} from '../@types/common/index.d.ts';
import type {ValuesProps} from '../@types/ui-react/index.d.ts';
import {arrayIsEmpty} from '../common/array.ts';
import {VALUES} from '../common/strings.ts';
import {ValuesInHtmlTable} from '../ui-react-dom/index.tsx';
import {useValueIds} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {ValueActions, ValuesActions} from './actions/values.tsx';
import {getUniqueId, useEditable} from './common.ts';
import type {StoreProp} from './types.ts';

const valueActions = [{label: '', component: ValueActions}];

export const ValuesView = ({
  store,
  storeId,
  s,
}: ValuesProps & {readonly storeId?: Id} & StoreProp) => {
  const uniqueId = getUniqueId('v', storeId);
  const [editable, handleEditable] = useEditable(uniqueId, s);
  return (
    <Details
      uniqueId={uniqueId}
      title={VALUES}
      editable={editable}
      handleEditable={handleEditable}
      s={s}
    >
      {arrayIsEmpty(useValueIds(store)) ? (
        <caption>No values.</caption>
      ) : (
        <ValuesInHtmlTable
          store={store}
          editable={editable}
          extraCellsAfter={editable ? valueActions : []}
        />
      )}
      {editable ? <ValuesActions store={store} /> : null}
    </Details>
  );
};
