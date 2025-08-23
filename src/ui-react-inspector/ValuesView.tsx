import type {Id} from '../@types/common/index.d.ts';
import type {ValuesProps} from '../@types/ui-react/index.d.ts';
import {arrayIsEmpty} from '../common/array.ts';
import {VALUES} from '../common/strings.ts';
import {ValuesInHtmlTable} from '../ui-react-dom/index.tsx';
import {useValueIds} from '../ui-react/index.ts';
import {Details} from './Details.tsx';
import {ConfirmableActions} from './actions/common.tsx';
import {valueActions, ValueAdd} from './actions/value.tsx';
import {getUniqueId, useEditable} from './common.ts';
import type {StoreProp} from './types.ts';

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
      {arrayIsEmpty(useValueIds(store)) ? null : (
        <ValuesInHtmlTable
          store={store}
          editable={editable}
          extraCellsAfter={editable ? valueActions : []}
        />
      )}
      {editable ? (
        <p>
          <ConfirmableActions
            actions={[['add', 'Add Value', ValueAdd]]}
            store={store}
          />
        </p>
      ) : null}
    </Details>
  );
};
