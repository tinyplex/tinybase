import type {Id} from '../../@types/common/index.d.ts';
import type {Queries} from '../../@types/queries/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import type {
  QuerySourceProps,
  TableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {createContext, useContext} from '../../common/react.ts';
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

export const SERIES = '_tinybaseChartSeries';
export const X_AXIS = '_tinybaseChartXAxis';
export const Y_AXIS = '_tinybaseChartYAxis';

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
  typeof component == 'function' &&
  (component as SeriesComponent)[SERIES] === true;
export const isXAxisComponent = (component: unknown): boolean =>
  typeof component == 'function' &&
  (component as XAxisComponent)[X_AXIS] === true;
export const isYAxisComponent = (component: unknown): boolean =>
  typeof component == 'function' &&
  (component as YAxisComponent)[Y_AXIS] === true;

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
  if (context == null) {
    throw new Error('Series components must be used inside a CartesianChart');
  }
  return context;
};
