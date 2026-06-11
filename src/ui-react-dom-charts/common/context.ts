import type {Id} from '../../@types/common/index.d.ts';
import type {Queries} from '../../@types/queries/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import type {
  ChartQuerySourceProps,
  ChartTableSourceProps,
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
  XValue,
} from './types.ts';

export const enum SourceType {
  None = 0,
  Query = 1,
  Table = 2,
}

export const CHART_SERIES = '_tinybaseChartSeries';
export const CHART_X_AXIS = '_tinybaseChartXAxis';
export const CHART_Y_AXIS = '_tinybaseChartYAxis';

export type ChartSeriesComponent = {
  [CHART_SERIES]?: true;
};
export type ChartXAxisComponent = {
  [CHART_X_AXIS]?: true;
};
export type ChartYAxisComponent = {
  [CHART_Y_AXIS]?: true;
};

export const isChartSeriesComponent = (component: unknown): boolean =>
  typeof component == 'function' &&
  (component as ChartSeriesComponent)[CHART_SERIES] === true;
export const isChartXAxisComponent = (component: unknown): boolean =>
  typeof component == 'function' &&
  (component as ChartXAxisComponent)[CHART_X_AXIS] === true;
export const isChartYAxisComponent = (component: unknown): boolean =>
  typeof component == 'function' &&
  (component as ChartYAxisComponent)[CHART_Y_AXIS] === true;

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
  readonly queriesOrQueriesId?: ChartQuerySourceProps['queries'];
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
  readonly storeOrStoreId?: ChartTableSourceProps['store'];
  readonly tableId?: Id;
  readonly xTicks: Ticks;
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
