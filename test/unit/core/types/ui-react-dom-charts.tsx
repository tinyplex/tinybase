// NB: an exclamation mark after a line visually indicates an expected TS error
import {
  BarChart,
  CartesianChart,
  LineChart,
  LineSeries,
} from 'tinybase/ui-react-dom-charts';
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
  BarSeries: BarSeriesWithSchemas,
  CartesianChart: CartesianChartWithSchemas,
  LineChart: LineChartWithSchemas,
  LineSeries: LineSeriesWithSchemas,
} = UiReactDomChartsWithSchemas;

const _App = () => {
  // prettier-ignore
  LineChartWithSchemas({ // !
    tableId: 't1',
    xCellId: 'c1',
    yCellId: 'c1d',
    sortCellId: 'c0',
  });
  // prettier-ignore
  BarChartWithSchemas({ // !
    tableId: 't1',
    queryId: 'q1',
    xCellId: 'c1',
    yCellId: 'c1d',
  });
  BarChartWithSchemas({
    queryId: 'q1',
    tableId: 't1', // !
    xCellId: 'c1',
    yCellId: 'c1d',
  });
  LineChart({
    // !
    tableId: 't',
    queryId: 'q',
    xCellId: 'x',
    yCellId: 'y',
  });
  BarChart({
    // !
    queryId: 'q',
    tableId: 't',
    xCellId: 'x',
    yCellId: 'y',
  });
  LineChart({
    tableId: 't',
    xCellId: 'x',
    yCellId: 'y',
    xDomain: [0, 1], // !
  });
  CartesianChart({tableId: 't', xCellId: 'x'}); // !
  CartesianChart({tableId: 't', xDomain: [0, 1]}); // !

  return (
    <>
      <LineChart tableId="t1" xCellId="c1" yCellId="c1d" />
      <BarChart queryId="q1" xCellId="c1" yCellId="c1d" />
      <CartesianChart tableId="t1">
        <span />
        <LineSeries className="sold" label="Sold" xCellId="c1" yCellId="c1d" />
      </CartesianChart>
      <LineSeries yCellId="c1d" /> {/* ! */}
      <LineSeries tableId="t1" xCellId="c1" yCellId="c1d" /> {/* ! */}
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
      <CartesianChartWithSchemas tableId="t1">
        <LineSeriesWithSchemas
          className="sold"
          label="Sold"
          xCellId="c1"
          yCellId="c1d"
        />
      </CartesianChartWithSchemas>
      <CartesianChartWithSchemas queryId="q1">
        <BarSeriesWithSchemas
          className="sold"
          label="Sold"
          xCellId="c1"
          yCellId="c1d"
        />
      </CartesianChartWithSchemas>
      <LineSeriesWithSchemas xCellId="c1" yCellId="c2" />
      <LineSeriesWithSchemas tableId="t1" xCellId="c1" yCellId="c1" /> {/* ! */}
      <BarChartWithSchemas tableId="t0" xCellId="c0" yCellId="c0" />
      <BarChartWithSchemas queryId="q1" xCellId="c2" yCellId="c3" />
      <LineChartWithSchemas tableId="t2" xCellId="c1" yCellId="c1d" /> {/* ! */}
      <LineChartWithSchemas tableId="t1" xCellId="c2" yCellId="c1" /> {/* ! */}
      <LineChartWithSchemas tableId="t1" xCellId="c0" yCellId="c1" /> {/* ! */}
      <LineChartWithSchemas tableId="t1" xCellId="c1" yCellId="c0" /> {/* ! */}
    </>
  );
};
