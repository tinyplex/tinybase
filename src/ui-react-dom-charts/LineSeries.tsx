import type {
  ChartSeriesProps,
  LineSeries as LineSeriesDecl,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {CHART_SERIES, useCartesianChartContext} from './common/context.ts';
import {Line} from './components/Line.tsx';
import {useSeries} from './components/series.ts';

export const LineSeries = ((props: ChartSeriesProps) => {
  const {plotFrame, setTooltipPoint} = useCartesianChartContext();
  const [, points] = useSeries('line', props);
  return (
    <g className="line-series">
      <Line
        plotFrame={plotFrame}
        points={points}
        setTooltipPoint={setTooltipPoint}
      />
    </g>
  );
}) as typeof LineSeriesDecl & {[CHART_SERIES]?: true};

LineSeries[CHART_SERIES] = true;
