import type {
  BindingProps,
  ChartProps,
  QuerySourceProps,
  TableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {isNullish} from '../../common/other.ts';

type ConvenienceChartProps = (TableSourceProps | QuerySourceProps) &
  BindingProps &
  ChartProps;

export const getConvenienceChartProps = (props: ConvenienceChartProps) =>
  [
    isNullish(props.tableId)
      ? {
          className: props.className,
          queries: props.queries,
          queryId: props.queryId as string,
        }
      : {
          className: props.className,
          store: props.store,
          tableId: props.tableId,
        },
    {
      descending: props.descending,
      limit: props.limit,
      offset: props.offset,
      sortCellId: props.sortCellId,
      xCellId: props.xCellId,
      yCellId: props.yCellId,
    },
  ] as const;
