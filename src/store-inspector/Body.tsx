/** @jsx createElement */

import {BODY_STYLE} from './style';
import {StoreProp} from './types';
import {StoreView} from './StoreView';
import {createElement} from '../ui-react/common';
import {useStore} from '../ui-react';

export const Body = (props: StoreProp) => {
  const store = useStore();
  return (
    <div style={BODY_STYLE}>
      {store ? (
        <StoreView store={store} storeId="Default" {...props} />
      ) : (
        'No store in context'
      )}
    </div>
  );
};
