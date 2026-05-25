import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import {useCallback, useState} from '../../common/react.ts';
import {
  getChartBounds,
  getChartDataPoint,
  getChartDataPoints,
  getChartScaledPoints,
  getChartTickBounds,
  getChartXTicks,
  getChartYTicks,
  type ChartKind,
  type ChartSize,
} from './data.ts';

export const useChartData = (
  kind: ChartKind,
  rowIds: string[],
  chartSize: ChartSize,
  labelSize: number,
  getXCell: (rowId: string) => CellOrUndefined | ResultCellOrUndefined,
  getYCell: (rowId: string) => CellOrUndefined | ResultCellOrUndefined,
) => {
  const [, rerender] = useState<[]>();
  const handleChange = useCallback(() => rerender([]), [rerender]);
  const points = getChartDataPoints(rowIds, (rowId) =>
    getChartDataPoint(rowId, getXCell(rowId), getYCell(rowId)),
  );
  const dataBounds = getChartBounds(kind, points);
  const xTicks = getChartXTicks(kind, dataBounds, chartSize, labelSize);
  const yTicks = getChartYTicks(dataBounds, chartSize, labelSize);
  const bounds = getChartTickBounds(dataBounds, xTicks, yTicks);

  return [
    handleChange,
    getChartScaledPoints(kind, points, bounds, chartSize),
    bounds,
    xTicks,
    yTicks,
  ] as const;
};
