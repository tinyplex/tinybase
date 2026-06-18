import {fireEvent, render} from '@testing-library/react';
import {act} from 'react';
import {createQueries, createStore} from 'tinybase';
import {Provider} from 'tinybase/ui-react';
import {
  BarChart,
  BarSeries,
  CartesianChart,
  LineChart,
  LineSeries,
  XAxis,
  YAxis,
} from 'tinybase/ui-react-dom-charts';
import {describe, expect, test} from 'vitest';

const CHARTS = [
  ['LineChart', LineChart],
  ['BarChart', BarChart],
] as const;

const getXAxisTickLabels = (container: HTMLElement): (string | null)[] =>
  Array.from(
    container.querySelectorAll('.axes .x .ticks text'),
    (text) => text.textContent,
  );

const getXAxisTickXs = (container: HTMLElement): number[] =>
  Array.from(container.querySelectorAll('.axes .x .ticks text'), (text) =>
    Number(text.getAttribute('x')),
  );

const getYAxisTickLabels = (container: HTMLElement): (string | null)[] =>
  Array.from(
    container.querySelectorAll('.axes .y .ticks text'),
    (text) => text.textContent,
  );

const getLinePathXs = (container: HTMLElement): number[][] =>
  Array.from(container.querySelectorAll('.plot .line-series .line'), (path) =>
    Array.from(
      path.getAttribute('d')?.matchAll(/[ML]([^,]+)/g) ?? [],
      ([, x]) => Number(x),
    ),
  );

const getBarCenters = (container: HTMLElement): number[] =>
  Array.from(container.querySelectorAll('.plot .bar'), (bar) => {
    return (
      Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')) / 2
    );
  });

const getBarWidths = (container: HTMLElement): number[] =>
  Array.from(container.querySelectorAll('.plot .bar'), (bar) =>
    Number(bar.getAttribute('width')),
  );

const getTimeAxisLabels = (
  min: string,
  max: string,
  tickCount: number,
): string[] => {
  const store = createStore().setTable('t1', {
    r1: {x: min, y: 3},
    r2: {x: max, y: 5},
  });
  const {container, unmount} = render(
    <LineChart store={store} tableId="t1" xCellId="x" yCellId="y">
      <XAxis scale="time" tickCount={tickCount} />
    </LineChart>,
  );
  const labels = getXAxisTickLabels(container) as string[];

  unmount();
  return labels;
};

describe.each(CHARTS)('%s', (_chartName, Chart) => {
  describe('Table', () => {
    test('binds to a Table from a Store', () => {
      const store = createStore().setTable('t1', {
        r1: {x: 1, y: 3},
        r2: {x: 2, y: 5},
        r3: {x: 3, y: 'bad'},
      });
      const {container, unmount} = render(
        <Chart store={store} tableId="t1" xCellId="x" yCellId="y" />,
      );

      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });

    test('binds to a Table from Provider context', () => {
      const store = createStore().setTable('t1', {
        r1: {x: 1, y: 3},
        r2: {x: 2, y: 5},
      });
      const {container, unmount} = render(
        <Provider store={store}>
          <Chart tableId="t1" xCellId="x" yCellId="y" limit={1} />
        </Provider>,
      );

      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });

    test('binds to a Table from Provider context by Store Id', () => {
      const store = createStore().setTable('t1', {
        r1: {x: 1, y: 3},
        r2: {x: 2, y: 5},
      });
      const {container, unmount} = render(
        <Provider storesById={{s1: store}}>
          <Chart store="s1" tableId="t1" xCellId="x" yCellId="y" />
        </Provider>,
      );

      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });

    test('updates when a Table Cell changes', () => {
      const store = createStore().setTable('t1', {
        r1: {x: 1, y: 3},
      });
      const {container, unmount} = render(
        <Chart store={store} tableId="t1" xCellId="x" yCellId="y" />,
      );

      expect(container.innerHTML).toMatchSnapshot();
      act(() => store.setCell('t1', 'r1', 'y', 4));
      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });

    test('renders an empty chart without a matching Store', () => {
      const {container, unmount} = render(
        <Chart tableId="t1" xCellId="x" yCellId="y" />,
      );

      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });
  });

  describe('Query', () => {
    test('binds to a Query from a Queries object', () => {
      const store = createStore().setTable('t1', {
        r1: {x: 1, y: 3},
        r2: {x: 2, y: 5},
      });
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => {
          select('x');
          select('y');
        },
      );
      const {container, unmount} = render(
        <Chart queries={queries} queryId="q1" xCellId="x" yCellId="y" />,
      );

      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });

    test('binds to a Query from Provider context', () => {
      const store = createStore().setTable('t1', {
        r1: {x: 1, y: 3},
        r2: {x: 2, y: 5},
      });
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => {
          select('x');
          select('y');
        },
      );
      const {container, unmount} = render(
        <Provider queries={queries}>
          <Chart
            queryId="q1"
            xCellId="x"
            yCellId="y"
            descending={true}
            sortCellId="y"
          />
        </Provider>,
      );

      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });

    test('binds to a Query from Provider context by Queries Id', () => {
      const store = createStore().setTable('t1', {
        r1: {x: 1, y: 3},
        r2: {x: 2, y: 5},
      });
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => {
          select('x');
          select('y');
        },
      );
      const {container, unmount} = render(
        <Provider queriesById={{q: queries}}>
          <Chart queries="q" queryId="q1" xCellId="x" yCellId="y" />
        </Provider>,
      );

      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });

    test('updates when a Query result Cell changes', () => {
      const store = createStore().setTable('t1', {
        r1: {x: 1, y: 3},
      });
      const queries = createQueries(store).setQueryDefinition(
        'q1',
        't1',
        ({select}) => {
          select('x');
          select('y');
        },
      );
      const {container, unmount} = render(
        <Chart queries={queries} queryId="q1" xCellId="x" yCellId="y" />,
      );

      expect(container.innerHTML).toMatchSnapshot();
      act(() => store.setCell('t1', 'r1', 'y', 4));
      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });

    test('renders an empty chart without a matching Queries object', () => {
      const {container, unmount} = render(
        <Chart queryId="q1" xCellId="x" yCellId="y" />,
      );

      expect(container.innerHTML).toMatchSnapshot();

      unmount();
    });
  });

  test('uses the Table when both a tableId and queryId are provided', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1, y: 3},
    });
    const queries = createQueries(
      createStore().setTable('t2', {r2: {x: 2, y: 5}}),
    ).setQueryDefinition('q1', 't2', ({select}) => {
      select('x');
      select('y');
    });
    const props: any = {
      queries,
      queryId: 'q1',
      store,
      tableId: 't1',
      xCellId: 'x',
      yCellId: 'y',
    };
    const {container, unmount} = render(<Chart {...props} />);

    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('renders an empty chart without source Id props', () => {
    const props: any = {xCellId: 'x', yCellId: 'y'};
    const {container, unmount} = render(<Chart {...props} />);

    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('uses axis child configuration', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 'Jan', y: 3, z: 1},
      r2: {x: 'Feb', y: 5, z: 2},
    });
    const {container, unmount} = render(
      <Chart store={store} tableId="t1" xCellId="x" yCellId="y" sortCellId="z">
        <XAxis
          className="month-axis"
          tickFormatter={(tick) => `M-${tick}`}
          title="Month"
        />
        <YAxis
          className="value-axis"
          tickFormatter={(tick) => `V-${tick}`}
          ticks={[0, 5]}
          title="Value"
        />
      </Chart>,
    );

    expect(container.querySelectorAll('.axes .x.month-axis')).toHaveLength(1);
    expect(container.querySelectorAll('.axes .y.value-axis')).toHaveLength(1);
    expect(getXAxisTickLabels(container)).toEqual(['M-Jan', 'M-Feb']);
    expect(getYAxisTickLabels(container)).toEqual(['V-0', 'V-5']);
    expect(container.innerHTML).toContain('>Month<');
    expect(container.innerHTML).toContain('>Value<');

    unmount();
  });
});

describe('CartesianChart', () => {
  test('uses XAxis and YAxis child configuration', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1, y: 3},
      r2: {x: 3, y: 7},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <XAxis
          className="time-axis"
          max={4}
          min={0}
          tickFormatter={(tick) => `D${tick}`}
          ticks={[0, 2, 4]}
          title="Day"
        />
        <YAxis
          className="money-axis"
          max={10}
          min={0}
          tickFormatter={(tick) => `$${tick}`}
          ticks={[0, 5, 10]}
          title="Revenue"
        />
        <LineSeries xCellId="x" yCellId="y" />
      </CartesianChart>,
    );

    expect(container.querySelectorAll('.axes .x.time-axis')).toHaveLength(1);
    expect(container.querySelectorAll('.axes .y.money-axis')).toHaveLength(1);
    expect(getXAxisTickLabels(container)).toEqual(['D0', 'D2', 'D4']);
    expect(getYAxisTickLabels(container)).toEqual(['$0', '$5', '$10']);
    expect(container.innerHTML).toContain('>Day<');
    expect(container.innerHTML).toContain('>Revenue<');
    expect(container.innerHTML).not.toContain('>x<');
    expect(container.innerHTML).not.toContain('>y<');
    expect(container.querySelectorAll('.plot .line')).toHaveLength(1);

    unmount();
  });

  test('uses XAxis tick formatting for categorical labels', () => {
    const store = createStore().setTable('t1', {
      r1: {x: true, y: 3, z: 1},
      r2: {x: false, y: 5, z: 2},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <XAxis tickFormatter={(tick) => String(tick).toUpperCase()} />
        <BarSeries xCellId="x" yCellId="y" sortCellId="z" />
      </CartesianChart>,
    );

    expect(getXAxisTickLabels(container)).toEqual(['TRUE', 'FALSE']);
    expect(container.querySelectorAll('.plot .bar')).toHaveLength(2);

    unmount();
  });

  test('uses explicit axis definitions before series data exists', () => {
    const {container, unmount} = render(
      <CartesianChart tableId="t1">
        <XAxis max={2} min={0} ticks={[0, 1, 2]} title="X" />
        <YAxis ticks={[0, 10]} title="Y" />
      </CartesianChart>,
    );

    expect(getXAxisTickLabels(container)).toEqual(['0', '1', '2']);
    expect(getYAxisTickLabels(container)).toEqual(['0', '10']);
    expect(container.innerHTML).toContain('>X<');
    expect(container.innerHTML).toContain('>Y<');
    expect(container.querySelectorAll('.plot *')).toHaveLength(0);

    unmount();
  });

  test('aligns categorical LineChart x-axis labels with points', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 'A', y: 3},
      r2: {x: 'B', y: 5},
      r3: {x: 'C', y: 4},
    });
    const {container, unmount} = render(
      <LineChart store={store} tableId="t1" xCellId="x" yCellId="y" />,
    );

    expect(getXAxisTickLabels(container)).toEqual(['A', 'B', 'C']);
    expect(getXAxisTickXs(container)).toEqual(getLinePathXs(container)[0]);

    unmount();
  });

  test('auto-detects ISO string x values as time', () => {
    const store = createStore().setTable('t1', {
      r1: {x: '2026-01-01', y: 3, z: 1},
      r2: {x: '2026-01-02', y: 5, z: 2},
      r3: {x: '2026-01-11', y: 4, z: 3},
    });
    const {container, unmount} = render(
      <LineChart
        store={store}
        tableId="t1"
        xCellId="x"
        yCellId="y"
        sortCellId="z"
      />,
    );
    const [firstX, secondX, thirdX] = getLinePathXs(container)[0];

    expect(secondX - firstX).toBeLessThan(thirdX - secondX);
    expect(
      getXAxisTickLabels(container).every((label) => {
        return /^2026-01-\d{2}$/.test(label ?? '');
      }),
    ).toBe(true);

    unmount();
  });

  test('normalizes explicit second timestamps as time', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1767225600, y: 3, z: 1},
      r2: {x: 1767312000, y: 5, z: 2},
      r3: {x: 1768089600, y: 4, z: 3},
    });
    const {container, unmount} = render(
      <LineChart
        store={store}
        tableId="t1"
        xCellId="x"
        yCellId="y"
        sortCellId="z"
      >
        <XAxis
          max="2026-01-11"
          min="2026-01-01"
          scale="time"
          tickFormatter={(date, timestamp) =>
            `${date.getUTCDate()}:${timestamp}`
          }
          ticks={['2026-01-01', '2026-01-11']}
          timestampUnit="second"
        />
      </LineChart>,
    );
    const [firstTickX, secondTickX] = getXAxisTickXs(container);
    const [firstX, secondX, thirdX] = getLinePathXs(container)[0];

    expect(getXAxisTickLabels(container)).toEqual([
      '1:1767225600000',
      '11:1768089600000',
    ]);
    expect(firstX).toBe(firstTickX);
    expect(thirdX).toBe(secondTickX);
    expect(secondX - firstX).toBeLessThan(thirdX - secondX);

    unmount();
  });

  test('generates deterministic UTC time tick labels', () => {
    (
      [
        [
          '2026-01-01T00:00:00Z',
          '2026-01-01T00:00:20Z',
          /^2026-01-01 00:00:\d{2}$/,
        ],
        [
          '2026-01-01T00:00:00Z',
          '2026-01-01T00:20:00Z',
          /^2026-01-01 00:\d{2}$/,
        ],
        [
          '2026-01-01T00:00:00Z',
          '2026-01-01T12:00:00Z',
          /^2026-01-01 \d{2}:00$/,
        ],
        ['2026-01-01', '2026-01-11', /^2026-01-\d{2}$/],
        ['2026-01-01', '2026-12-31', /^202[67]-\d{2}$/],
        ['2020-01-01', '2030-01-01', /^20\d{2}$/],
      ] as const
    ).forEach(([min, max, pattern]) => {
      const labels = getTimeAxisLabels(min, max, 5);

      expect(labels.length).toBeGreaterThan(1);
      expect(labels.every((label) => pattern.test(label))).toBe(true);
    });
  });

  test('generates weekly and quarterly UTC time ticks', () => {
    const weekLabels = getTimeAxisLabels('2026-01-01', '2026-02-12', 7);
    const quarterLabels = getTimeAxisLabels('2026-01-01', '2027-01-01', 5);

    expect(
      Date.parse(`${weekLabels[1]}T00:00:00Z`) -
        Date.parse(`${weekLabels[0]}T00:00:00Z`),
    ).toBe(7 * 24 * 60 * 60 * 1000);
    expect(quarterLabels).toEqual([
      '2026-01',
      '2026-04',
      '2026-07',
      '2026-10',
      '2027-01',
    ]);
  });

  test('keeps BarChart x values categorical by default', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 0, y: 3, z: 1},
      r2: {x: 5, y: 5, z: 2},
      r3: {x: 20, y: 4, z: 3},
    });
    const {container, unmount} = render(
      <BarChart
        store={store}
        tableId="t1"
        xCellId="x"
        yCellId="y"
        sortCellId="z"
      />,
    );
    const [firstX, secondX, thirdX] = getBarCenters(container);

    expect(secondX - firstX).toBeCloseTo(thirdX - secondX);

    unmount();
  });

  test('uses continuous x positioning for linear BarChart axes', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 0, y: 3, z: 1},
      r2: {x: 5, y: 5, z: 2},
      r3: {x: 20, y: 4, z: 3},
    });
    const {container, unmount} = render(
      <BarChart
        store={store}
        tableId="t1"
        xCellId="x"
        yCellId="y"
        sortCellId="z"
      >
        <XAxis max={20} min={0} scale="linear" ticks={[0, 5, 20]} />
      </BarChart>,
    );
    const centers = getBarCenters(container);
    const tickXs = getXAxisTickXs(container);

    centers.forEach((center, index) => {
      expect(center).toBeCloseTo(tickXs[index]);
    });
    expect(getBarWidths(container)[0]).toBeLessThan(centers[1] - centers[0]);

    unmount();
  });

  test('uses continuous x positioning for time BarChart axes', () => {
    const store = createStore().setTable('t1', {
      r1: {x: '2026-01-01', y: 3, z: 1},
      r2: {x: '2026-01-02', y: 5, z: 2},
      r3: {x: '2026-01-11', y: 4, z: 3},
    });
    const {container, unmount} = render(
      <BarChart
        store={store}
        tableId="t1"
        xCellId="x"
        yCellId="y"
        sortCellId="z"
      >
        <XAxis
          max="2026-01-11"
          min="2026-01-01"
          scale="time"
          ticks={['2026-01-01', '2026-01-02', '2026-01-11']}
        />
      </BarChart>,
    );
    const centers = getBarCenters(container);
    const tickXs = getXAxisTickXs(container);

    centers.forEach((center, index) => {
      expect(center).toBeCloseTo(tickXs[index]);
    });
    expect(getBarWidths(container)[0]).toBeLessThan(centers[1] - centers[0]);

    unmount();
  });

  test('renders a LineSeries from Table props', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1, y: 3},
      r2: {x: 2, y: 5},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <LineSeries xCellId="x" yCellId="y" />
      </CartesianChart>,
    );

    expect(container.querySelectorAll('.plot .line')).toHaveLength(1);
    expect(container.querySelectorAll('.plot circle')).toHaveLength(2);
    expect(container.innerHTML).toContain('>y<');

    unmount();
  });

  test('ignores non-series children', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1, y: 3},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <span>Ignored</span>
        <>
          <span>Also ignored</span>
          <LineSeries xCellId="x" yCellId="y" />
        </>
      </CartesianChart>,
    );

    expect(container.querySelector('span')).toBeNull();
    expect(container.querySelectorAll('.plot .line')).toHaveLength(1);

    unmount();
  });

  test('renders multiple LineSeries with shared bounds', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1, y1: 3, y2: 8},
      r2: {x: 2, y1: 5, y2: 6},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <LineSeries
          className="revenue-series"
          label="Revenue"
          xCellId="x"
          yCellId="y1"
        />
        <LineSeries
          className="profit-series"
          label="Profit"
          xCellId="x"
          yCellId="y2"
        />
      </CartesianChart>,
    );

    expect(container.querySelectorAll('.plot .line')).toHaveLength(2);
    expect(container.querySelectorAll('.revenue-series')).toHaveLength(1);
    expect(container.querySelectorAll('.profit-series')).toHaveLength(1);
    expect(container.innerHTML).toContain('>8<');
    expect(container.innerHTML).toContain('>Revenue &amp; Profit<');

    act(() => store.setCell('t1', 'r1', 'y2', 4));

    expect(container.innerHTML).not.toContain('>8<');
    expect(container.innerHTML).toContain('>5<');

    unmount();
  });

  test('uses y Cell Ids for multiple unlabelled series titles', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1, y1: 3, y2: 8},
      r2: {x: 2, y1: 5, y2: 6},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <LineSeries xCellId="x" yCellId="y1" />
        <LineSeries xCellId="x" yCellId="y2" />
      </CartesianChart>,
    );

    expect(container.innerHTML).toContain('>y1 &amp; y2<');

    unmount();
  });

  test('uses all y Cell Ids for three unlabelled series titles', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1, y1: 3, y2: 8, y3: 13},
      r2: {x: 2, y1: 5, y2: 6, y3: 10},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <LineSeries xCellId="x" yCellId="y1" />
        <LineSeries xCellId="x" yCellId="y2" />
        <LineSeries xCellId="x" yCellId="y3" />
      </CartesianChart>,
    );

    expect(container.innerHTML).toContain('>y1 &amp; y2 &amp; y3<');

    unmount();
  });

  test('renders LineSeries with different x Cell Ids and sort orders', () => {
    const store = createStore().setTable('t1', {
      r1: {x1: 'Feb', x2: 'Beta', y1: 3, y2: 8, z1: 2, z2: 2},
      r2: {x1: 'Jan', x2: 'Alpha', y1: 5, y2: 6, z1: 1, z2: 1},
      r3: {x1: 'Mar', x2: 'Gamma', y1: 4, y2: 9, z1: 3, z2: 3},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <LineSeries xCellId="x1" yCellId="y1" sortCellId="z1" />
        <LineSeries
          descending={true}
          xCellId="x2"
          yCellId="y2"
          sortCellId="z2"
        />
      </CartesianChart>,
    );

    expect(container.querySelectorAll('.plot .line')).toHaveLength(2);
    expect(container.querySelectorAll('.plot circle')).toHaveLength(6);
    expect(getXAxisTickLabels(container)).toEqual([
      'Jan',
      'Feb',
      'Mar',
      'Gamma',
      'Beta',
      'Alpha',
    ]);
    expect(container.innerHTML).toContain('>x1 &amp; x2<');
    expect(container.innerHTML).toContain('>y1 &amp; y2<');
    expect(container.innerHTML).not.toContain('Infinity');

    unmount();
  });

  test('renders numeric LineSeries with different x sort orders', () => {
    const store = createStore().setTable('t1', {
      r1: {x1: 1, x2: 7, y1: 2, y2: 6, z1: 1, z2: 1},
      r2: {x1: 3, x2: 4, y1: 4, y2: 4, z1: 2, z2: 2},
      r3: {x1: 5, x2: 2, y1: 6, y2: 2, z1: 3, z2: 3},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <LineSeries xCellId="x1" yCellId="y1" sortCellId="z1" />
        <LineSeries xCellId="x2" yCellId="y2" sortCellId="z2" />
      </CartesianChart>,
    );
    const tickLabels = getXAxisTickLabels(container);
    const [firstLineXs, secondLineXs] = getLinePathXs(container);

    expect(container.querySelectorAll('.plot .line')).toHaveLength(2);
    expect(container.querySelectorAll('.plot circle')).toHaveLength(6);
    expect(tickLabels).toContain('1');
    expect(tickLabels).toContain('6');
    expect(tickLabels).toContain('7');
    expect(firstLineXs).toHaveLength(3);
    expect(secondLineXs).toHaveLength(3);
    expect(firstLineXs[0]).toBeLessThan(firstLineXs[1]);
    expect(firstLineXs[1]).toBeLessThan(firstLineXs[2]);
    expect(secondLineXs[0]).toBeGreaterThan(secondLineXs[1]);
    expect(secondLineXs[1]).toBeGreaterThan(secondLineXs[2]);
    expect(container.innerHTML).toContain('>x1 &amp; x2<');
    expect(container.innerHTML).toContain('>y1 &amp; y2<');
    expect(container.innerHTML).not.toContain('Infinity');

    unmount();
  });

  test('renders a BarSeries from Query props', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 1, y: 3},
      r2: {x: 2, y: 5},
    });
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('x');
        select('y');
      },
    );
    const {container, unmount} = render(
      <CartesianChart queries={queries} queryId="q1">
        <BarSeries xCellId="x" yCellId="y" />
      </CartesianChart>,
    );

    expect(container.querySelectorAll('.plot .bar')).toHaveLength(2);
    expect(container.innerHTML).not.toContain('Infinity');

    unmount();
  });

  test('renders BarSeries with sparse x Cell Ids and sort orders', () => {
    const store = createStore().setTable('t1', {
      r1: {x1: 'A', x2: 'C', y1: 3, y2: 9, z1: 1, z2: 3},
      r2: {x1: 'B', x2: 'A', y1: 5, y2: 4, z1: 2, z2: 1},
      r3: {x1: 'D', x2: 'E', y1: 7, y2: 6, z1: 4, z2: 5},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <BarSeries xCellId="x1" yCellId="y1" sortCellId="z1" />
        <BarSeries
          descending={true}
          xCellId="x2"
          yCellId="y2"
          sortCellId="z2"
        />
      </CartesianChart>,
    );

    expect(container.querySelectorAll('.plot .bar')).toHaveLength(6);
    expect(getXAxisTickLabels(container)).toEqual(['A', 'B', 'D', 'E', 'C']);
    expect(container.innerHTML).toContain('>x1 &amp; x2<');
    expect(container.innerHTML).toContain('>y1 &amp; y2<');
    expect(container.innerHTML).not.toContain('Infinity');

    unmount();
  });

  test('renders boolean x values as categories', () => {
    const store = createStore().setTable('t1', {
      r1: {x: true, y: 3, z: 1},
      r2: {x: false, y: 5, z: 2},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <BarSeries xCellId="x" yCellId="y" sortCellId="z" />
      </CartesianChart>,
    );
    const bars = container.querySelectorAll('.plot .bar');

    expect(bars).toHaveLength(2);
    expect(getXAxisTickLabels(container)).toEqual(['true', 'false']);
    expect(container.innerHTML).toContain('>x<');
    expect(container.innerHTML).not.toContain('Infinity');

    fireEvent.pointerEnter(bars[0]);

    expect(container.querySelector('.tooltip rect')?.getAttribute('fill')).toBe(
      '#111827',
    );
    expect(
      container.querySelector('.tooltip rect')?.getAttribute('fill-opacity'),
    ).toBe('0.9');
    expect(
      container.querySelector('.tooltip')?.getAttribute('font-weight'),
    ).toBe('600');
    expect(container.innerHTML).toContain('>x: true<');
    expect(container.innerHTML).toContain('>y: 3<');

    unmount();
  });

  test('renders multiple BarSeries side-by-side', () => {
    const store = createStore().setTable('t1', {
      r1: {x: 'a', y1: 3, y2: 4},
      r2: {x: 'b', y1: 5, y2: 6},
    });
    const {container, unmount} = render(
      <CartesianChart store={store} tableId="t1">
        <BarSeries
          className="orders-series"
          label="Orders"
          xCellId="x"
          yCellId="y1"
        />
        <BarSeries
          className="profit-series"
          label="Profit"
          xCellId="x"
          yCellId="y2"
        />
      </CartesianChart>,
    );
    const bars = container.querySelectorAll('.bar');

    expect(bars).toHaveLength(4);
    expect(container.innerHTML).not.toContain('Infinity');
    expect(container.querySelector('.bar-series > g > .bar')).toBeNull();
    expect(container.querySelector('.bar-series')?.getAttribute('fill')).toBe(
      'currentColor',
    );
    expect(bars[0].getAttribute('fill')).toBeNull();
    expect(container.querySelectorAll('.orders-series')).toHaveLength(1);
    expect(container.querySelectorAll('.profit-series')).toHaveLength(1);
    expect(bars[0].getAttribute('x')).not.toEqual(bars[2].getAttribute('x'));
    expect(container.innerHTML).toContain('>Orders &amp; Profit<');

    fireEvent.pointerEnter(bars[2]);

    expect(container.innerHTML).toContain('>Profit: 4<');
    expect(container.innerHTML).not.toContain('>Orders &amp; Profit: 4<');

    unmount();
  });
});
