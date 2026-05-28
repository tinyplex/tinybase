// NB: an exclamation mark after a line visually indicates an expected TS error
import {BarChart, LineChart} from 'tinybase/ui-react-dom-charts';
import * as UiReactDomCharts from 'tinybase/ui-react-dom-charts/with-schemas';

const _tablesSchema = {
  t0: {c0: {type: 'number'}},
  t1: {
    c1: {type: 'number'},
    c1d: {type: 'string', default: ''},
  },
} as const;

const _valuesSchema = {
  v1: {type: 'number'},
} as const;

const UiReactDomChartsWithSchemas =
  UiReactDomCharts as UiReactDomCharts.WithSchemas<
    [typeof _tablesSchema, typeof _valuesSchema]
  >;
const {
  BarChart: BarChartWithSchemas,
  LineChart: LineChartWithSchemas,
} = UiReactDomChartsWithSchemas;

const _App = () => (
  <>
    <LineChart tableId="t1" xCellId="c1" yCellId="c1d" />
    <BarChart queryId="q1" xCellId="c1" yCellId="c1d" />
    <LineChart tableId="t1" queryId="q1" xCellId="c1" yCellId="c1d" /> {/* ! */}
    <BarChart queryId="q1" tableId="t1" xCellId="c1" yCellId="c1d" /> {/* ! */}
    {/*
    
    */}
    <LineChartWithSchemas tableId="t1" xCellId="c1" yCellId="c1d" />
    <LineChartWithSchemas
      tableId="t1"
      xCellId="c1"
      yCellId="c1d"
      sortCellId="c1"
      descending={true}
      offset={1}
      limit={2}
      className="sales"
    />
    <BarChartWithSchemas tableId="t0" xCellId="c0" yCellId="c0" />
    <BarChartWithSchemas queryId="q1" xCellId="c2" yCellId="c3" />
    <LineChartWithSchemas tableId="t2" xCellId="c1" yCellId="c1d" /> {/* ! */}
    <LineChartWithSchemas tableId="t1" xCellId="c2" yCellId="c1" /> {/* ! */}
    <LineChartWithSchemas tableId="t1" xCellId="c0" yCellId="c1" /> {/* ! */}
    <LineChartWithSchemas tableId="t1" xCellId="c1" yCellId="c0" /> {/* ! */}
    <LineChartWithSchemas tableId="t1" xCellId="c1" yCellId="c1d" sortCellId="c0" /> {/* ! */}
    <BarChartWithSchemas tableId="t1" queryId="q1" xCellId="c1" yCellId="c1d" /> {/* ! */}
    <BarChartWithSchemas queryId="q1" tableId="t1" xCellId="c1" yCellId="c1d" /> {/* ! */}
  </>
);
