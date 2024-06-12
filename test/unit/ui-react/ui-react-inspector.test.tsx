/* eslint-disable max-len */
/* eslint-disable react/jsx-no-useless-fragment */

import {
  ReactTestRenderer,
  ReactTestRendererJSON,
  act,
  create,
} from 'react-test-renderer';
import {Inspector} from 'tinybase/ui-react-inspector';
import React from 'react';
import {pause} from '../common/other.ts';

let renderer: ReactTestRenderer;

describe('Inspector', () => {
  test('basic', async () => {
    sessionStorage.clear();
    act(() => {
      renderer = create(<Inspector />);
    });
    await act(pause);
    expect((renderer.toJSON() as ReactTestRendererJSON[])[0])
      .toMatchInlineSnapshot(`
      <aside
        id="tinybaseInspector"
      >
        <img
          data-position={3}
          onClick={[Function]}
          title="TinyBase Inspector"
        />
      </aside>
    `);
  });

  test('position', async () => {
    sessionStorage.clear();
    act(() => {
      renderer = create(<Inspector position="left" />);
    });
    await act(pause);
    expect((renderer.toJSON() as ReactTestRendererJSON[])[0])
      .toMatchInlineSnapshot(`
      <aside
        id="tinybaseInspector"
      >
        <img
          data-position={0}
          onClick={[Function]}
          title="TinyBase Inspector"
        />
      </aside>
    `);
  });
});
