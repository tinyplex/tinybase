import type {
  ChartBindingProps,
  ChartProps,
  ChartTableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {
  useCellListener,
  useSortedRowIds,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {useData} from '../common/hooks.ts';
import {getLabelSize, getPlotSize, useLayout} from '../common/svg.ts';
import type {Kind} from '../common/types.ts';
import {Layout} from './Layout.tsx';

export const TableChart = ({
  descending,
  className,
  kind,
  limit,
  offset,
  sortCellId,
  storeOrStoreId,
  tableId,
  xCellId,
  yCellId,
}: Omit<ChartTableSourceProps, 'store'> &
  ChartBindingProps &
  ChartProps & {
    readonly kind: Kind;
    readonly storeOrStoreId: ChartTableSourceProps['store'];
  }) => {
  const layout = useLayout();
  const store = useStoreOrStoreById(storeOrStoreId);
  const rowIds = useSortedRowIds(
    tableId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    storeOrStoreId,
  );
  const [handleChange, points, bounds, xTicks, yTicks] = useData(
    kind,
    rowIds,
    getPlotSize(layout),
    getLabelSize(layout),
    (rowId) => store?.getCell(tableId, rowId, xCellId),
    (rowId) => store?.getCell(tableId, rowId, yCellId),
  );

  useCellListener(
    tableId,
    null,
    xCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId,
  );
  useCellListener(
    tableId,
    null,
    yCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId,
  );

  return (
    <Layout
      className={className}
      kind={kind}
      points={points}
      bounds={bounds}
      titles={[xCellId, yCellId]}
      xTicks={xTicks}
      yTicks={yTicks}
      layout={layout}
    />
  );
};
