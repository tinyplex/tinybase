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
} from 'tinybase/ui-react-dom-charts';
import {describe, expect, test} from 'vitest';

const CHARTS = [
  ['LineChart', LineChart],
  ['BarChart', BarChart],
] as const;

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
});

describe('CartesianChart', () => {
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
    expect(container.querySelectorAll('.orders-series')).toHaveLength(1);
    expect(container.querySelectorAll('.profit-series')).toHaveLength(1);
    expect(bars[0].getAttribute('x')).not.toEqual(bars[2].getAttribute('x'));
    expect(container.innerHTML).toContain('>Orders &amp; Profit<');

    fireEvent.pointerEnter(bars[2].parentElement as Element);

    expect(container.innerHTML).toContain('>Profit: 4<');
    expect(container.innerHTML).not.toContain('>Orders &amp; Profit: 4<');

    unmount();
  });
});
