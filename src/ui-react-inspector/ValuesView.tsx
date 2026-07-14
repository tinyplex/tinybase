import type {Id} from '../@types/common/index.d.ts';
import type {ValuesProps} from '../@types/ui-react/index.d.ts';

import {getUniqueId} from '../common/inspector/common.ts';
import type {StoreProp} from '../common/inspector/types.ts';
import {isEmpty} from '../common/other.ts';
import {VALUES} from '../common/strings.ts';
import {ValuesInHtmlTable} from '../ui-react-dom/index.tsx';
import {useValueIds} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {ValueActions, ValuesActions} from './actions/values.tsx';
import {useEditable} from './editable.ts';

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
      {isEmpty(useValueIds(store)) ? (
        <p>No values.</p>
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
