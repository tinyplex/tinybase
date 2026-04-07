import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import {Provider} from 'tinybase/ui-react';
import {Inspector} from 'tinybase/ui-react-inspector';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';

const getDetails = (title: string): HTMLDetailsElement => {
  const details = screen.getByText(title).closest('details');
  expect(details).not.toBeNull();
  return details as HTMLDetailsElement;
};

const getSummaryAction = (title: string, actionTitle: string): HTMLElement => {
  const summary = screen.getByText(title).closest('summary');
  expect(summary).not.toBeNull();
  const action = summary?.querySelector(`img[title="${actionTitle}"]`);
  expect(action).not.toBeNull();
  return action as HTMLElement;
};

const getDetailsAction = (title: string, actionTitle: string): HTMLElement => {
  const action = getDetails(title).querySelector(`img[title="${actionTitle}"]`);
  expect(action).not.toBeNull();
  return action as HTMLElement;
};

const getRowAction = (
  tableTitle: string,
  rowId: string,
  actionTitle: string,
): HTMLElement => {
  const row = getDetails(tableTitle)
    .querySelector(`th[title="${rowId}"]`)
    ?.closest('tr');
  expect(row).not.toBeNull();
  const action = row?.querySelector(`img[title="${actionTitle}"]`);
  expect(action).not.toBeNull();
  return action as HTMLElement;
};

const getValueAction = (valueId: string, actionTitle: string): HTMLElement => {
  const row = getDetails('Values')
    .querySelector(`th[title="${valueId}"]`)
    ?.closest('tr');
  expect(row).not.toBeNull();
  const action = row?.querySelector(`img[title="${actionTitle}"]`);
  expect(action).not.toBeNull();
  return action as HTMLElement;
};

const getCellAction = (
  tableTitle: string,
  rowId: string,
  actionTitle: string,
  index: number = 0,
): HTMLElement => {
  const row = getDetails(tableTitle)
    .querySelector(`th[title="${rowId}"]`)
    ?.closest('tr');
  expect(row).not.toBeNull();
  const actions = row?.querySelectorAll(`img[title="${actionTitle}"]`);
  expect(actions?.[index]).not.toBeNull();
  return actions?.[index] as HTMLElement;
};

const NO_PROVIDER_MESSAGE =
  'There are no Stores or other objects to inspect. Make sure you placed ' +
  'the Inspector inside a Provider component.';

describe('Inspector', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    expect(
      consoleError.mock.calls
        .map(([msg]: [string, ...any[]]) => msg)
        .filter(
          (msg: string) =>
            !msg.startsWith('In HTML, %s cannot be a child of <%s>.%s'),
        ),
      'Unexpected React console.error calls',
    ).toEqual([]);
    consoleError.mockRestore();
    vi.unstubAllGlobals();
  });

  test('basic', async () => {
    const {container, unmount} = render(<Inspector />);

    await waitFor(() => {
      const inspector = screen.getByTitle('TinyBase Inspector');
      expect(inspector).toBeInTheDocument();

      const aside = container.querySelector('aside');
      expect(aside).toHaveAttribute('id', 'tinybaseInspector');

      expect(screen.getByTitle('TinyBase Inspector')).toHaveAttribute(
        'data-position',
        '3',
      );
      expect(container.querySelector('main')).toBeNull();
    });

    unmount();
  });

  test('position', async () => {
    const {container, unmount} = render(<Inspector position="left" />);

    await waitFor(() => {
      expect(screen.getByTitle('TinyBase Inspector')).toBeInTheDocument();
      expect(container.querySelector('aside')).toHaveAttribute(
        'id',
        'tinybaseInspector',
      );
      expect(screen.getByTitle('TinyBase Inspector')).toHaveAttribute(
        'data-position',
        '0',
      );
    });

    unmount();
  });

  test('open, close, and dock', async () => {
    const {container, unmount} = render(<Inspector open={true} hue={120} />);

    await waitFor(() => {
      expect(container.querySelector('main')).not.toBeNull();
      expect(container.querySelector('main')).toHaveAttribute(
        'data-position',
        '3',
      );
      expect(container.querySelector('aside')?.getAttribute('style')).toContain(
        '120',
      );
    });

    fireEvent.click(screen.getByTitle('Dock to left'));
    await waitFor(() =>
      expect(container.querySelector('main')).toHaveAttribute(
        'data-position',
        '0',
      ),
    );

    fireEvent.click(screen.getByTitle('Close'));
    await waitFor(() => {
      expect(container.querySelector('main')).toBeNull();
      expect(screen.getByTitle('TinyBase Inspector')).toHaveAttribute(
        'data-position',
        '0',
      );
    });

    fireEvent.click(screen.getByTitle('TinyBase Inspector'));
    await waitFor(() =>
      expect(container.querySelector('main')).toHaveAttribute(
        'data-position',
        '0',
      ),
    );

    unmount();
  });

  test('persists state', async () => {
    const {container, unmount} = render(<Inspector open={true} />);

    await waitFor(() => expect(screen.getByRole('main')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Dock to left'));
    await waitFor(() =>
      expect(container.querySelector('main')).toHaveAttribute(
        'data-position',
        '0',
      ),
    );
    await waitFor(() =>
      expect(sessionStorage.getItem('tinybaseInspector')).toContain(
        '"position":0',
      ),
    );
    unmount();

    const rerendered = render(<Inspector />);
    await waitFor(() =>
      expect(rerendered.container.querySelector('main')).toHaveAttribute(
        'data-position',
        '0',
      ),
    );
    rerendered.unmount();
  });

  test('open, no provider', async () => {
    const {unmount} = render(<Inspector open={true} />);

    await waitFor(() => {
      expect(screen.getByText(NO_PROVIDER_MESSAGE)).toBeInTheDocument();
    });

    unmount();
  });

  test('open, with provider', async () => {
    const store = createStore();
    const {container, unmount} = render(
      <Provider store={store}>
        <Inspector open={true} />
      </Provider>,
    );

    await waitFor(() => {
      expect(container.querySelector('main')).not.toBeNull();
      expect(screen.getByText('No values.')).toBeInTheDocument();
      expect(screen.getByText('No tables.')).toBeInTheDocument();
      expect(screen.queryByText(NO_PROVIDER_MESSAGE)).toBeNull();
    });

    unmount();
  });

  test('open, with provider and content', async () => {
    const store = createStore()
      .setTables({
        t1: {r1: {c1: 1, c2: 'two'}, r2: {c1: 3, c2: 'four'}},
        t2: {r1: {c1: 2}},
      })
      .setValues({v1: 1});
    const metrics = createMetrics(store).setMetricDefinition(
      'm1',
      't1',
      'sum',
      'c1',
    );
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    const relationships = createRelationships(store).setRelationshipDefinition(
      'r1',
      't1',
      't2',
      'c1',
    );
    const queries = createQueries(store).setQueryDefinition(
      'q1',
      't1',
      ({select}) => {
        select('c1');
        select('c2');
      },
    );
    const {unmount} = render(
      <Provider
        store={store}
        metrics={metrics}
        indexes={indexes}
        relationships={relationships}
        queries={queries}
      >
        <Inspector open={true} />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.queryByText('No values.')).toBeNull();
      expect(screen.queryByText('No tables.')).toBeNull();
      expect(screen.getByText('Store: default')).toBeInTheDocument();
      expect(screen.getByText('Values')).toBeInTheDocument();
      expect(screen.getByText('Tables')).toBeInTheDocument();
      expect(screen.getByText('Metrics: default')).toBeInTheDocument();
      expect(screen.getByText('Indexes: default')).toBeInTheDocument();
      expect(screen.getByText('Relationships: default')).toBeInTheDocument();
      expect(screen.getByText('Queries: default')).toBeInTheDocument();
      expect(screen.getByText('Index: i1')).toBeInTheDocument();
      expect(screen.getByText('Relationship: r1')).toBeInTheDocument();
      expect(screen.getByText('Query: q1')).toBeInTheDocument();
      expect(screen.getByText('Metric Id')).toBeInTheDocument();
      expect(screen.getByTitle('v1')).toBeInTheDocument();
    });

    unmount();
  });

  test('editable values and tables', async () => {
    const store = createStore()
      .setTables({
        t1: {r1: {c1: 1, c2: 'two'}, r2: {c1: 3, c2: 'four'}},
        t2: {r1: {c1: 2}},
      })
      .setValues({v1: 1});
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    const relationships = createRelationships(store).setRelationshipDefinition(
      'r1',
      't1',
      't2',
      'c1',
    );
    const {unmount} = render(
      <Provider store={store} indexes={indexes} relationships={relationships}>
        <Inspector open={true} />
      </Provider>,
    );

    await waitFor(() => expect(screen.getByText('Values')).toBeInTheDocument());

    fireEvent.click(getSummaryAction('Values', 'Edit'));
    await waitFor(() =>
      expect(getSummaryAction('Values', 'Done editing')).toBeInTheDocument(),
    );

    fireEvent.click(getValueAction('v1', 'Clone value'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('v1 (copy)')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.getValue('v1 (copy)')).toBe(1));

    fireEvent.click(getDetailsAction('Values', 'Add value'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('value')).toBeInTheDocument(),
    );
    fireEvent.input(screen.getByDisplayValue('value'), {
      target: {value: 'v2'},
    });
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.getValue('v2')).toBe(''));

    fireEvent.click(getValueAction('v1 (copy)', 'Delete value'));
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasValue('v1 (copy)')).toBe(false));

    fireEvent.click(getSummaryAction('Tables', 'Edit'));
    await waitFor(() =>
      expect(getSummaryAction('Tables', 'Done editing')).toBeInTheDocument(),
    );

    fireEvent.click(getDetailsAction('Table: t1', 'Edit'));
    await waitFor(() =>
      expect(getSummaryAction('Table: t1', 'Done editing')).toBeInTheDocument(),
    );

    fireEvent.click(getDetailsAction('Table: t1', 'Add row'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('row')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasRow('t1', 'row')).toBe(true));

    fireEvent.click(getRowAction('Table: t1', 'r1', 'Add cell'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('cell')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasCell('t1', 'r1', 'cell')).toBe(true));

    fireEvent.click(getSummaryAction('Slice: 1', 'Edit'));
    await waitFor(() =>
      expect(getDetails('Slice: 1').querySelector('input')).not.toBeNull(),
    );

    fireEvent.click(getSummaryAction('Relationship: r1', 'Edit'));
    await waitFor(() =>
      expect(
        getDetails('Relationship: r1').querySelector('input'),
      ).not.toBeNull(),
    );

    fireEvent.click(getCellAction('Table: t1', 'r1', 'Delete cell'));
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasCell('t1', 'r1', 'c1')).toBe(false));

    fireEvent.click(getRowAction('Table: t1', 'r1', 'Clone row'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('r1 (copy)')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasRow('t1', 'r1 (copy)')).toBe(true));

    fireEvent.click(getDetailsAction('Table: t2', 'Edit'));
    await waitFor(() =>
      expect(getSummaryAction('Table: t2', 'Done editing')).toBeInTheDocument(),
    );
    fireEvent.click(getDetailsAction('Table: t2', 'Delete table'));
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasTable('t2')).toBe(false));

    fireEvent.click(getDetailsAction('Table: t1', 'Clone table'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('t1 (copy)')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() =>
      expect(store.getTable('t1 (copy)')).toEqual(store.getTable('t1')),
    );

    fireEvent.click(getDetailsAction('Tables', 'Add table'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('table')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasTable('table')).toBe(true));

    fireEvent.click(getRowAction('Table: t1', 'r1', 'Delete row'));
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasRow('t1', 'r1')).toBe(false));

    unmount();
  });

  test('delete all values and tables', async () => {
    const store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
    const {unmount} = render(
      <Provider store={store}>
        <Inspector open={true} />
      </Provider>,
    );

    await waitFor(() => expect(screen.getByText('Values')).toBeInTheDocument());

    fireEvent.click(getSummaryAction('Values', 'Edit'));
    fireEvent.click(getSummaryAction('Tables', 'Edit'));

    fireEvent.click(getDetailsAction('Values', 'Delete all values'));
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasValues()).toBe(false));

    fireEvent.click(getDetailsAction('Tables', 'Delete all tables'));
    fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasTables()).toBe(false));

    unmount();
  });
});
