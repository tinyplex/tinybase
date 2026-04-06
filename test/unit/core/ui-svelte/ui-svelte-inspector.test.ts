import {render} from '@testing-library/svelte';
import {describe, expect, test} from 'vitest';

import {Inspector} from 'tinybase/ui-svelte-inspector';

describe('Inspector', () => {
  test('basic', () => {
    const {container, unmount} = render(Inspector);
    const inspector = container.querySelector('aside');

    expect(inspector?.getAttribute('id')).toBe('tinybaseInspector');
    expect(inspector?.getAttribute('title')).toBe('TinyBase Inspector');
    expect(inspector?.getAttribute('data-position')).toBe('right');
    expect(inspector?.getAttribute('data-open')).toBe('false');
    expect(inspector?.getAttribute('style')).toContain('--hue: 270;');

    unmount();
  });

  test('props', () => {
    const {container, unmount} = render(Inspector, {
      props: {position: 'left', open: true, hue: 120},
    });
    const inspector = container.querySelector('aside');

    expect(inspector?.getAttribute('data-position')).toBe('left');
    expect(inspector?.getAttribute('data-open')).toBe('true');
    expect(inspector?.getAttribute('style')).toContain('--hue: 120;');

    unmount();
  });
});
