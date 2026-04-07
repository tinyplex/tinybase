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
      expect(container.querySelector('main')?.getAttribute('data-position')).toBe(
        '0',
      ),
    );

    await fireEvent.click(screen.getByTitle('Close'));
    await waitFor(() => {
      expect(container.querySelector('main')).toBeNull();
      expect(screen.getByTitle('TinyBase Inspector').getAttribute('data-position')).toBe(
        '0',
      );
    });

    await fireEvent.click(screen.getByTitle('TinyBase Inspector'));
    await waitFor(() =>
      expect(container.querySelector('main')?.getAttribute('data-position')).toBe(
        '0',
      ),
    );

    unmount();
  });

  test('persists state', async () => {
    const {container, unmount} = render(Inspector, {props: {open: true}});

    await waitFor(() => expect(screen.getByRole('main')).not.toBeNull());
    await fireEvent.click(screen.getByTitle('Dock to left'));
    await waitFor(() =>
      expect(container.querySelector('main')?.getAttribute('data-position')).toBe(
        '0',
      ),
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
        rerendered.container.querySelector('main')?.getAttribute('data-position'),
      ).toBe('0');
    });
    rerendered.unmount();
  });

  test('open, no provider', async () => {
    const {unmount} = render(Inspector, {props: {open: true}});

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no Stores or other objects to inspect. Make sure you placed the Inspector inside a Provider component.',
        ),
      ).not.toBeNull();
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
      expect(
        screen.queryByText(
          'There are no Stores or other objects to inspect. Make sure you placed the Inspector inside a Provider component.',
        ),
      ).toBeNull();
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
    const metrics = createMetrics(store).setMetricDefinition('m1', 't1', 'sum', 'c1');
    const indexes = createIndexes(store).setIndexDefinition('i1', 't1', 'c1');
    const relationships = createRelationships(store).setRelationshipDefinition(
      'r1',
      't1',
      't2',
      'c1',
    );
    const queries = createQueries(store).setQueryDefinition('q1', 't1', ({select}) => {
      select('c1');
      select('c2');
    });
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
});
