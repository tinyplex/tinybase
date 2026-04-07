import {fireEvent, render, screen, waitFor} from '@testing-library/svelte';
import {
  createIndexes,
  createMetrics,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';

import {Inspector} from 'tinybase/ui-svelte-inspector';
import WithProvider from './components/inspector/WithProvider.svelte';

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
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('basic', async () => {
    const {container, unmount} = render(Inspector);

    await waitFor(() => {
      const inspector = screen.getByTitle('TinyBase Inspector');
      expect(inspector).not.toBeNull();

      const aside = container.querySelector('aside');
      expect(aside?.getAttribute('id')).toBe('tinybaseInspector');

      const image = screen.getByTitle('TinyBase Inspector');
      expect(image.getAttribute('data-position')).toBe('3');
      expect(container.querySelector('main')).toBeNull();
    });

    unmount();
  });

  test('position', async () => {
    const {container, unmount} = render(Inspector, {
      props: {position: 'left'},
    });

    await waitFor(() => {
      const inspector = screen.getByTitle('TinyBase Inspector');
      expect(inspector).not.toBeNull();

      const aside = container.querySelector('aside');
      expect(aside?.getAttribute('id')).toBe('tinybaseInspector');

      const image = screen.getByTitle('TinyBase Inspector');
      expect(image.getAttribute('data-position')).toBe('0');
    });

    unmount();
  });

  test('open, close, and dock', async () => {
    const {container, unmount} = render(Inspector, {
      props: {open: true, hue: 120},
    });

    await waitFor(() => {
      const main = container.querySelector('main');
      expect(main).not.toBeNull();
      expect(main?.getAttribute('data-position')).toBe('3');
      expect(container.querySelector('aside')?.getAttribute('style')).toContain(
        '120',
      );
    });

    await fireEvent.click(screen.getByTitle('Dock to left'));
    await waitFor(() =>
      expect(
        container.querySelector('main')?.getAttribute('data-position'),
      ).toBe('0'),
    );

    await fireEvent.click(screen.getByTitle('Close'));
    await waitFor(() => {
      expect(container.querySelector('main')).toBeNull();
      expect(
        screen.getByTitle('TinyBase Inspector').getAttribute('data-position'),
      ).toBe('0');
    });

    await fireEvent.click(screen.getByTitle('TinyBase Inspector'));
    await waitFor(() =>
      expect(
        container.querySelector('main')?.getAttribute('data-position'),
      ).toBe('0'),
    );

    unmount();
  });

  test('persists state', async () => {
    const {container, unmount} = render(Inspector, {props: {open: true}});

    await waitFor(() => expect(screen.getByRole('main')).not.toBeNull());
    await fireEvent.click(screen.getByTitle('Dock to left'));
    await waitFor(() =>
      expect(
        container.querySelector('main')?.getAttribute('data-position'),
      ).toBe('0'),
    );
    await waitFor(() =>
      expect(sessionStorage.getItem('tinybaseInspector')).toContain(
        '"position":0',
      ),
    );
    unmount();

    const rerendered = render(Inspector);
    await waitFor(() => {
      expect(
        rerendered.container
          .querySelector('main')
          ?.getAttribute('data-position'),
      ).toBe('0');
    });
    rerendered.unmount();
  });

  test('open, no provider', async () => {
    const {unmount} = render(Inspector, {props: {open: true}});

    await waitFor(() => {
      expect(screen.getByText(NO_PROVIDER_MESSAGE)).not.toBeNull();
    });

    unmount();
  });

  test('open, with provider', async () => {
    const store = createStore();
    const {container, unmount} = render(WithProvider, {props: {store}});

    await waitFor(() => {
      expect(container.querySelector('main')).not.toBeNull();
      expect(screen.getByText('No values.')).not.toBeNull();
      expect(screen.getByText('No tables.')).not.toBeNull();
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
    const {unmount} = render(WithProvider, {
      props: {store, metrics, indexes, relationships, queries},
    });

    await waitFor(() => {
      expect(screen.queryByText('No values.')).toBeNull();
      expect(screen.queryByText('No tables.')).toBeNull();
      expect(screen.getByText('Store: default')).not.toBeNull();
      expect(screen.getByText('Values')).not.toBeNull();
      expect(screen.getByText('Tables')).not.toBeNull();
      expect(screen.getByText('Metrics: default')).not.toBeNull();
      expect(screen.getByText('Indexes: default')).not.toBeNull();
      expect(screen.getByText('Relationships: default')).not.toBeNull();
      expect(screen.getByText('Queries: default')).not.toBeNull();
      expect(screen.getByText('Index: i1')).not.toBeNull();
      expect(screen.getByText('Relationship: r1')).not.toBeNull();
      expect(screen.getByText('Query: q1')).not.toBeNull();
      expect(screen.getByText('Metric Id')).not.toBeNull();
      expect(screen.getByTitle('v1')).not.toBeNull();
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
    const {unmount} = render(WithProvider, {
      props: {store, indexes, relationships},
    });

    await waitFor(() => expect(screen.getByText('Values')).not.toBeNull());

    await fireEvent.click(getSummaryAction('Values', 'Edit'));
    await waitFor(() =>
      expect(getSummaryAction('Values', 'Done editing')).not.toBeNull(),
    );

    await fireEvent.click(getValueAction('v1', 'Clone value'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('v1 (copy)')).not.toBeNull(),
    );
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.getValue('v1 (copy)')).toBe(1));

    await fireEvent.click(getDetailsAction('Values', 'Add value'));
    await fireEvent.input(screen.getByDisplayValue('value'), {
      target: {value: 'v2'},
    });
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.getValue('v2')).toBe(''));

    await fireEvent.click(getValueAction('v1 (copy)', 'Delete value'));
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasValue('v1 (copy)')).toBe(false));

    await fireEvent.click(getSummaryAction('Tables', 'Edit'));
    await waitFor(() =>
      expect(getSummaryAction('Tables', 'Done editing')).not.toBeNull(),
    );

    await fireEvent.click(getDetailsAction('Table: t1', 'Edit'));
    await waitFor(() =>
      expect(getSummaryAction('Table: t1', 'Done editing')).not.toBeNull(),
    );

    await fireEvent.click(getDetailsAction('Table: t1', 'Add row'));
    await waitFor(() => expect(screen.getByDisplayValue('row')).not.toBeNull());
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasRow('t1', 'row')).toBe(true));

    await fireEvent.click(getRowAction('Table: t1', 'r1', 'Add cell'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('cell')).not.toBeNull(),
    );
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasCell('t1', 'r1', 'cell')).toBe(true));

    await fireEvent.click(getSummaryAction('Slice: 1', 'Edit'));
    await waitFor(() =>
      expect(getDetails('Slice: 1').querySelector('input')).not.toBeNull(),
    );

    await fireEvent.click(getSummaryAction('Relationship: r1', 'Edit'));
    await waitFor(() =>
      expect(
        getDetails('Relationship: r1').querySelector('input'),
      ).not.toBeNull(),
    );

    await fireEvent.click(getCellAction('Table: t1', 'r1', 'Delete cell'));
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasCell('t1', 'r1', 'c1')).toBe(false));

    await fireEvent.click(getRowAction('Table: t1', 'r1', 'Clone row'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('r1 (copy)')).not.toBeNull(),
    );
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasRow('t1', 'r1 (copy)')).toBe(true));

    await fireEvent.click(getDetailsAction('Table: t2', 'Edit'));
    await waitFor(() =>
      expect(getSummaryAction('Table: t2', 'Done editing')).not.toBeNull(),
    );
    await fireEvent.click(getDetailsAction('Table: t2', 'Delete table'));
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasTable('t2')).toBe(false));

    await fireEvent.click(getDetailsAction('Table: t1', 'Clone table'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('t1 (copy)')).not.toBeNull(),
    );
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() =>
      expect(store.getTable('t1 (copy)')).toEqual(store.getTable('t1')),
    );

    await fireEvent.click(getDetailsAction('Tables', 'Add table'));
    await waitFor(() =>
      expect(screen.getByDisplayValue('table')).not.toBeNull(),
    );
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasTable('table')).toBe(true));

    await fireEvent.click(getRowAction('Table: t1', 'r1', 'Delete row'));
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasRow('t1', 'r1')).toBe(false));

    unmount();
  });

  test('delete all values and tables', async () => {
    const store = createStore()
      .setTables({t1: {r1: {c1: 1}}})
      .setValues({v1: 1});
    const {unmount} = render(WithProvider, {props: {store}});

    await waitFor(() => expect(screen.getByText('Values')).not.toBeNull());

    await fireEvent.click(getSummaryAction('Values', 'Edit'));
    await fireEvent.click(getSummaryAction('Tables', 'Edit'));

    await fireEvent.click(getDetailsAction('Values', 'Delete all values'));
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasValues()).toBe(false));

    await fireEvent.click(getDetailsAction('Tables', 'Delete all tables'));
    await fireEvent.click(screen.getByTitle('Confirm'));
    await waitFor(() => expect(store.hasTables()).toBe(false));

    unmount();
  });
});
