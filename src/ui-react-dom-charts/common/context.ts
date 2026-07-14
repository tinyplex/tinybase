import type {Id} from '../../@types/common/index.d.ts';
import type {Queries} from '../../@types/queries/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import type {
  QuerySourceProps,
  TableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {ERROR_CHART, errorThrow} from '../../common/error.ts';
import {isFunction, isNullish} from '../../common/other.ts';
import {createContext, useContext} from '../../common/react.ts';
import {SERIES, X_AXIS, Y_AXIS} from './strings.ts';
import type {
  Bounds,
  DomainState,
  PlotFrame,
  RefAndLayout,
  SeriesSummary,
  SetTooltipPoint,
  Size,
  Ticks,
  TimestampUnit,
  XScale,
  XValue,
} from './types.ts';

export const enum SourceType {
  None = 0,
  Query = 1,
  Table = 2,
}

export type SeriesComponent = {
  [SERIES]?: true;
};
export type XAxisComponent = {
  [X_AXIS]?: true;
};
export type YAxisComponent = {
  [Y_AXIS]?: true;
};

export const isSeriesComponent = (component: unknown): boolean =>
  isFunction(component) && (component as SeriesComponent)[SERIES] === true;
export const isXAxisComponent = (component: unknown): boolean =>
  isFunction(component) && (component as XAxisComponent)[X_AXIS] === true;
export const isYAxisComponent = (component: unknown): boolean =>
  isFunction(component) && (component as YAxisComponent)[Y_AXIS] === true;

export type CartesianChartContextValue = {
  readonly bounds: Bounds;
  readonly barSeriesCount: number;
  readonly getBarSeriesIndex: (seriesId: Id) => number;
  readonly domainState: DomainState;
  readonly getSeriesId: () => Id;
  readonly layout: RefAndLayout;
  readonly plotFrame: PlotFrame;
  readonly plotSize: Size;
  readonly queryId?: Id;
  readonly queries?: Queries;
  readonly queriesOrQueriesId?: QuerySourceProps['queries'];
  readonly releaseSeriesId: (seriesId: Id) => void;
  readonly registerBarSeries: (seriesId: Id) => void;
  readonly releaseBarSeries: (seriesId: Id) => void;
  readonly setSeriesSummary: (
    seriesId: Id,
    summary: SeriesSummary | undefined,
  ) => void;
  readonly setTooltipPoint: SetTooltipPoint;
  readonly sourceType: SourceType;
  readonly store?: Store;
  readonly storeOrStoreId?: TableSourceProps['store'];
  readonly tableId?: Id;
  readonly timestampUnit: TimestampUnit;
  readonly xTicks: Ticks;
  readonly xScale: XScale;
  readonly xValues: XValue[];
  readonly yTicks: Ticks;
};

export const CartesianChartContext =
  createContext<CartesianChartContextValue | null>(null);

export const useCartesianChartContext = (): CartesianChartContextValue => {
  const context = useContext(CartesianChartContext);
  if (isNullish(context)) {
    errorThrow(ERROR_CHART);
  }
  return context as CartesianChartContextValue;
};
