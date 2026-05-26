import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import {useCallback, useState} from '../../common/react.ts';
import {
  getBounds,
  getDataPoint,
  getDataPoints,
  getScaledPoints,
  getTickBounds,
  getXTicks,
  getYTicks,
} from './data.ts';
import type {Kind, Size} from './types.ts';

export const useData = (
  kind: Kind,
  rowIds: string[],
  chartSize: Size,
  labelSize: number,
  getXCell: (rowId: string) => CellOrUndefined | ResultCellOrUndefined,
  getYCell: (rowId: string) => CellOrUndefined | ResultCellOrUndefined,
) => {
  const [, rerender] = useState<[]>();
  const handleChange = useCallback(() => rerender([]), [rerender]);
  const points = getDataPoints(rowIds, (rowId) =>
    getDataPoint(rowId, getXCell(rowId), getYCell(rowId)),
  );
  const dataBounds = getBounds(kind, points);
  const xTicks = getXTicks(kind, dataBounds, chartSize, labelSize);
  const yTicks = getYTicks(dataBounds, chartSize, labelSize);
  const bounds = getTickBounds(dataBounds, xTicks, yTicks);

  return [
    handleChange,
    getScaledPoints(kind, points, bounds, chartSize),
    bounds,
    xTicks,
    yTicks,
  ] as const;
};
