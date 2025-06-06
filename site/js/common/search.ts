import {createIndexes} from 'tinybase/indexes';
import {createStore} from 'tinybase/store';
import {
  addClass,
  createElement,
  delClass,
  doc,
  go,
  preventDefault,
  query,
  queryElement,
} from './common.ts';

const SHORT_WORDS = [
  'db',
  'id',
  'ids',
  'no',
  'ui',
  'ws',
  'add',
  'api',
  'bun',
  'del',
  'dom',
  'for',
  'get',
  'has',
  'hlc',
  'log',
  'map',
  'row',
  'set',
  'sql',
  'use',
  'web',
  'yjs',
];

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
      // Put in slices based on prefixes of tokens
      (getCell) => {
        const slices: string[] = [];
        (getCell('t') as string).split(' ').forEach((word) => {
          for (let i = 0; i < word.length; i++) {
            slices.push(word.slice(0, i + 1));
          }
        });
        return slices;
      },
      't',
      undefined,
      // Rank by the density of early location of the slice in the text
      (tokens1, tokens2, sliceId) =>
        getWeighting(tokens2 as string, sliceId) -
        getWeighting(tokens1 as string, sliceId),
    );

    // Load search store, hydrate 't' tokens cell, and enable input
    fetch('/pages.json')
      .then((response) => response.json())
      .then((json) => {
        store.transaction(() => {
          store.setContent(json);
          store.forEachRow('p', (path) => {
            const {n, s} = store.getRow('p', path) as {n: string; s: string};
            const tokens = new Set<string>();
            tokenize(path, tokens, true);
            tokenize(n, tokens);
            tokenize(s, tokens);
            store.setCell('p', path, 't', [...tokens.values()].join(' '));
          });
        });
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
      const queryWords = input.value.toLowerCase().split(/[^a-z0-9]+/);
      const pathWeights: {[path: string]: number} = {};
      queryWords.forEach((queryWord) =>
        indexes
          .getSliceRowIds('p', queryWord)
          .slice(0, 10)
          .forEach(
            (path) =>
              (pathWeights[path] =
                (pathWeights[path] ?? 0) +
                getWeighting(
                  store.getCell('p', path, 't') as string,
                  queryWord,
                )),
          ),
      );
      const paths = Object.keys(pathWeights)
        .sort((a, b) => pathWeights[b] - pathWeights[a])
        .slice(0, 10);

      const newResults =
        paths.length == 0
          ? [noResults]
          : paths.map((path, i) => {
              const result = createElement('li');
              const {n, s} = store.getRow('p', path) as {n: string; s: string};
              highlighted(createElement('b', result), n, queryWords[0]);
              highlighted(createElement('span', result), s, queryWords[0]);
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
              preventDefault(event);
              return moveHover(
                hovered,
                hovered?.nextSibling ?? results.firstChild,
              );
            case 'ArrowUp':
              preventDefault(event);
              return moveHover(
                hovered,
                hovered?.previousSibling ?? results.lastChild,
              );
            case 'Enter':
              return hovered?.dispatchEvent(new MouseEvent('mousedown'));
          }
        } else if (event.code == 'KeyK' && event.metaKey) {
          input.focus();
          preventDefault(event);
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

// Tokenize a string into words, optionally reversing the order
const tokenize = (string: string, tokens: Set<string>, reverse?: boolean) => {
  const words = string.replaceAll(/[^a-zA-Z0-9]/g, ' ').split(/\s+/);
  if (reverse) {
    words.reverse();
  }
  words.forEach((word) => {
    [word, ...word.replaceAll(/([a-z])([A-Z])/g, '$1 $2').split(' ')].forEach(
      (wordPart) => {
        const token = wordPart.toLowerCase();
        if (token.length > 3 || SHORT_WORDS.includes(token)) {
          tokens.add(token);
        }
      },
    );
  });
};

// Get the weighting of a word in a string based on its position
const getWeighting = (tokens: string, word: string) => {
  const length = tokens.length;
  const position = tokens.indexOf(word);
  return position === -1 ? 0 : (length - position) / length;
};
