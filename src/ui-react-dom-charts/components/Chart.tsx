import type {
  ChartBindingProps,
  ChartProps,
  ChartQuerySourceProps,
  ChartTableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {isUndefined} from '../../common/other.ts';
import type {Kind} from '../common/types.ts';
import {EmptyChart} from './EmptyChart.tsx';
import {QueryChart} from './QueryChart.tsx';
import {TableChart} from './TableChart.tsx';

export const Chart = ({
  className,
  store,
  tableId,
  queries,
  queryId,
  ...props
}: (ChartTableSourceProps | ChartQuerySourceProps) &
  ChartBindingProps &
  ChartProps & {readonly kind: Kind}) =>
  isUndefined(tableId) ? (
    isUndefined(queryId) ? (
      <EmptyChart {...props} className={className} />
    ) : (
      <QueryChart
        {...props}
        className={className}
        queriesOrQueriesId={queries}
        queryId={queryId}
      />
    )
  ) : (
    <TableChart
      {...props}
      className={className}
      storeOrStoreId={store}
      tableId={tableId}
    />
  );
