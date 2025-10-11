import '@testing-library/jest-dom/vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {Inspector} from 'tinybase/ui-react-inspector';
import {beforeEach, describe, expect, test} from 'vitest';

describe('Inspector', () => {
  beforeEach(() => {
    sessionStorage.clear();
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
});
