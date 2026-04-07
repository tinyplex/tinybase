import {fireEvent, render, screen, waitFor} from '@testing-library/svelte';
import {createStore} from 'tinybase';
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
      expect(
        screen.queryByText(
          'There are no Stores or other objects to inspect. Make sure you placed the Inspector inside a Provider component.',
        ),
      ).toBeNull();
    });

    unmount();
  });
});
