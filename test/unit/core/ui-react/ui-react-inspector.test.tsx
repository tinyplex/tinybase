import '@testing-library/jest-dom/vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {createStore} from 'tinybase';
import {Provider} from 'tinybase/ui-react';
import {Inspector} from 'tinybase/ui-react-inspector';
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';

describe('Inspector', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    expect(
      consoleError.mock.calls.map(([msg]: [string, ...any[]]) => msg),
      'Unexpected React console.error calls',
    ).toEqual([]);
    consoleError.mockRestore();
  });

  test('basic', async () => {
    const {unmount} = render(<Inspector />);

    await waitFor(() => {
      const inspector = screen.getByTitle('TinyBase Inspector');
      expect(inspector).toBeInTheDocument();

      const aside = inspector.closest('aside');
      expect(aside).toHaveAttribute('id', 'tinybaseInspector');

      const image = screen.getByTitle('TinyBase Inspector');
      expect(image).toHaveAttribute('data-position', '3');
    });

    unmount();
  });

  test('position', async () => {
    const {unmount} = render(<Inspector position="left" />);

    await waitFor(() => {
      const inspector = screen.getByTitle('TinyBase Inspector');
      expect(inspector).toBeInTheDocument();

      const aside = inspector.closest('aside');
      expect(aside).toHaveAttribute('id', 'tinybaseInspector');

      const image = screen.getByTitle('TinyBase Inspector');
      expect(image).toHaveAttribute('data-position', '0');
    });

    unmount();
  });

  test('open', async () => {
    const {unmount} = render(<Inspector open={true} />);

    await waitFor(() => {
      const inspector = screen.getAllByTitle('TinyBase Inspector')[0];
      expect(inspector).toBeInTheDocument();

      const aside = inspector.closest('aside');
      expect(aside).toHaveAttribute('id', 'tinybaseInspector');
    });

    unmount();
  });

  test('open, no values or tables', async () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {});

    const store = createStore();
    const {unmount} = render(
      <Provider store={store}>
        <Inspector open={true} />
      </Provider>,
    );

    await waitFor(() => {
      const inspector = screen.getAllByTitle('TinyBase Inspector')[0];
      expect(inspector).toBeInTheDocument();

      expect(screen.getByText('No tables.')).toBeInTheDocument();
      expect(screen.getByText('No values.')).toBeInTheDocument();
    });

    unmount();
    setItem.mockRestore();
  });
});
