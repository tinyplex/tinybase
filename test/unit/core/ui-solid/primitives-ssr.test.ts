import {renderToString} from 'solid-js/web';
import {createStore} from 'tinybase';
import {useCell, useCellListener} from 'tinybase/ui-solid';
import {expect, test, vi} from 'vitest';

test('does not subscribe during server rendering', () => {
  const store = createStore().setCell('pets', 'fido', 'species', 'dog');
  const listener = vi.fn();

  for (let render = 0; render < 3; render++) {
    expect(
      renderToString(() => {
        const species = useCell('pets', 'fido', 'species', store);
        useCellListener('pets', 'fido', 'species', listener, undefined, store);
        return species();
      }),
    ).toBe('dog');
    expect(store.getListenerStats().cell).toBe(0);
  }

  expect(listener).not.toHaveBeenCalled();
});
