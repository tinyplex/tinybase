import '@testing-library/jest-dom';
import {render, screen, waitFor} from '@testing-library/react';
import {Inspector} from 'tinybase/ui-react-inspector';
import React from 'react';

describe('Inspector', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('basic', async () => {
    render(<Inspector />);

    await waitFor(() => {
      const inspector = screen.getByTitle('TinyBase Inspector');
      expect(inspector).toBeInTheDocument();

      const aside = inspector.closest('aside');
      expect(aside).toHaveAttribute('id', 'tinybaseInspector');

      const image = screen.getByTitle('TinyBase Inspector');
      expect(image).toHaveAttribute('data-position', '3');
    });
  });

  test('position', async () => {
    render(<Inspector position="left" />);

    await waitFor(() => {
      const inspector = screen.getByTitle('TinyBase Inspector');
      expect(inspector).toBeInTheDocument();

      const aside = inspector.closest('aside');
      expect(aside).toHaveAttribute('id', 'tinybaseInspector');

      const image = screen.getByTitle('TinyBase Inspector');
      expect(image).toHaveAttribute('data-position', '0');
    });
  });
});
