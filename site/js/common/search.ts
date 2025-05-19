import {createIndexes} from 'tinybase/indexes';
import {createStore, type GetCell} from 'tinybase/store';
import {
  addClass,
  createElement,
  delClass,
  doc,
  go,
  query,
  queryElement,
} from './common.ts';

export const searchLoad = (isHome = false) => {
  addEventListener('load', () => {
    const nav: HTMLElement = query('body > header > nav');
    if (nav == null) {
      return;
    }

    // Create UI
    const search = createElement('div', null, {id: 'search'});
    const input = createElement('input', search, {
      type: 'text',
      placeholder:
        (navigator.platform.startsWith('Mac') ? '⌘' : 'cmd-') + 'K Search',
    }) as HTMLInputElement;
    const results = createElement('ol', search);
    const noResults = createElement('li', results, {}, 'No results found');

    // Create search store
    const store = createStore();

    // Define search index
    const indexes = createIndexes(store);
    indexes.setIndexDefinition(
      'p',
      'p',
      // Put in slices based on prefixes of words
      (getCell, path) => {
        const slices: string[] = [];
        getWords(getCell, path).forEach((word) => {
          for (let i = 0; i < word.length; i++) {
            slices.push(word.slice(0, i + 1));
          }
        });
        return slices;
      },
      // Rank will be based on content
      (getCell, path) => getWords(getCell, path).join(' '),
      undefined,
      // Rank by the density of early location of the slice in the text
      (words1, words2, sliceId) =>
        getWeighting(words2, sliceId) - getWeighting(words1, sliceId),
    );

    // Tokenize text for each path
    const getWords = (getCell: GetCell, path: string): string[] =>
      [
        ...path.split(/\/|-|_/), // path
        ...(getCell('n') as string).split(' '), // name
        ...(getCell('s') as string).split(' '), // summary
      ].filter((word) => word.length > 3);

    // Load search store and enable input
    fetch('/pages.json')
      .then((response) => response.json())
      .then((json) => {
        store.setContent(json);
        bindUI();
      });

    // UI behavior
    const bindUI = () => {
      nav.prepend(search);
      const showResults = () =>
        (input.value ? addClass : delClass)(results, 'show');
      input.addEventListener('focus', showResults);
      input.addEventListener('input', () => {
        showResults();
        populateResults();
      });
      input.addEventListener('blur', () => delClass(results, 'show'));
      bindKeyboard();
    };

    // Populate results
    const populateResults = () => {
      const value = input.value.toLowerCase();
      const rowIds = indexes.getSliceRowIds('p', value).slice(0, 10);

      const newResults =
        rowIds.length == 0
          ? [noResults]
          : rowIds.map((path, i) => {
              const result = createElement('li');
              const {n, s} = store.getRow('p', path) as {n: string; s: string};
              highlighted(createElement('b', result), n, value);
              highlighted(createElement('span', result), s, value);
              result.title = s; // Show full summary on hover
              result.addEventListener('mousedown', () =>
                isHome ? (location.href = path) : go(path),
              );
              if (i == 0) {
                addClass(result, 'hover');
              }
              return result;
            });

      results.replaceChildren(...newResults);
    };

    // Keyboard navigation
    const bindKeyboard = () =>
      addEventListener('keydown', (event: KeyboardEvent) => {
        if (doc.activeElement == input) {
          const hovered = queryElement(results, '.hover');
          switch (event.code) {
            case 'Escape':
              return input.blur();
            case 'ArrowDown':
              return moveHover(
                hovered,
                hovered?.nextSibling ?? results.firstChild,
              );
            case 'ArrowUp':
              return moveHover(
                hovered,
                hovered?.previousSibling ?? results.lastChild,
              );
            case 'Enter':
              return hovered?.dispatchEvent(new MouseEvent('mousedown'));
          }
        } else if (event.code == 'KeyK' && event.metaKey) {
          input.focus();
        }
      });
  });
};

// Highlight search fragment in text
const highlighted = (element: HTMLElement, str: string, value: string) => {
  const location = str.toLowerCase().indexOf(value);
  element.innerHTML =
    location == -1
      ? str
      : str.substring(0, location) +
        '<em>' +
        str.substring(location, location + value.length) +
        '</em>' +
        str.substring(location + value.length);
};

// Move hover class through the results
const moveHover = (current: any, next: any) => {
  if (current != next) {
    if (current) {
      delClass(current, 'hover');
    }
    if (next) {
      addClass(next, 'hover');
      next.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }
};

const getWeighting = (str: string, substr: string) => {
  const length = str.length;
  let weight = 0;
  let position = str.indexOf(substr);
  while (position !== -1) {
    weight += (length - position) / length;
    position = str.indexOf(substr, position + 1);
  }
  return weight;
};
