# Word Frequencies

In this demo, we load the list of the 10,000 most common words in English, index
them for a fast search experience, and showcase TinyBase v2.1's ability to
register a Row in multiple Slice arrays of an Index.

We use the [New General Service List](http://www.newgeneralservicelist.org/) by
Browne, C., Culligan, B., and Phillips, J. as the source of these words and
frequencies, and the derivative words.tsv is shared under CC BY-SA 4.0. Thank
you!

## Boilerplate

As per usual, we first pull in React, ReactDOM, and TinyBase:

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase/index.js"></script>
<script src="/umd/tinybase/ui-react/index.js"></script>
```

We need the following parts of the TinyBase API, the ui-react module, and React
itself:

```js
const {Provider, useCreateIndexes, useCreateStore, useRow, useSliceRowIds} =
  TinyBaseUiReact;
const {createIndexes, createStore} = TinyBase;
const {useCallback, useMemo, useState} = React;
```

## Loading The Data

The word data for the application has been converted into a tab-separated
variable format with a ranked row per word, and its typical frequency per
million words.

|            |       |
| ---------- | ----- |
| the        | 60910 |
| be         | 48575 |
| and        | 30789 |
| ...        | ...   |
| eigenvalue | 0     |

TSV files are smaller and faster than JSON to load over the wire, but
nonetheless, we load it asynchronously and insert it into the `words` Table in a
single transaction:

```js
const loadWords = async (store) => {
  const words = (
    await (await fetch(`https://tinybase.org/assets/words.tsv`)).text()
  ).split('\n');
  store.transaction(() =>
    words.forEach((row, rowId) => {
      const [word, perMillion] = row.split('\t');
      store.addRow('words', {
        rank: rowId + 1,
        word,
        perMillion: Number(perMillion),
      });
    }),
  );
};
```

As you can see, each Row in the `words` Table ends up with three Cell Ids:
`rank`, `word`, and `perMillion`.

## Indexing The Data

In the main part of the application, we will initialize an Indexes object called
`indexes`. This has an Index defined, called `stems`, which has a Slice for
every stem of every word.

For example, the word `the` will appear in the Slices with Ids `''`, `t`, `th`,
and `the`. The word `theme` will appear in those too, as well as those with Ids
`them` and `theme` - and so on.

We build the Index with the setIndexDefinition method, providing a custom
function that returns the stems (including the empty string) for each word:

```js
const indexWords = (store) =>
  createIndexes(store).setIndexDefinition('stems', 'words', (getCell) => {
    const word = getCell('word');
    const stems = [];
    for (let l = 0; l <= word.length; l++) {
      stems.push(word.substring(0, l));
    }
    return stems;
  });
```

The Index of 10,000 words comprises almost 30,000 of these stems, containing
over 80,000 word entries between them. Nevertheless, building this index takes
less than 250ms, even on my feeble old laptop.

(Note that this indexing strategy is reasonably naive. For a large-scale
autocomplete application, a data structure like a [Trie or Patricia
tree](https://en.wikipedia.org/wiki/Trie) might be more appropriate.)

## Initializing The Application

In the main part of the application, we want to initialize a default Store
called `store`, and an Indexes object called `indexes`. The latter is
initialized with the function above.

The two objects are memoized by the useCreateStore method and useCreateIndexes
method so they are only created the first time the app is rendered.

```jsx
const App = () => {
  const store = useCreateStore(createStore);
  const indexes = useCreateIndexes(store, indexWords);
  // ...
```

To provide a spinner while the words are loading and being indexed, we have an
`isLoading` flag in the application's state, and setting it to `false` only once
the asynchronous loading sequence (described above) has completed. Until then, a
loading spinner is shown.

For the loaded application, the UI comprises literally just the input box and
the results. They are bound together using just one state variable (`stem`),
which contains the text that the user has entered into the search box.

```jsx
  // ...
  const [isLoading, setIsLoading] = useState(true);
  useMemo(async () => {
    await loadWords(store);
    setIsLoading(false);
  }, []);

  const [stem, setStem] = useState('');
  return (
    <Provider store={store} indexes={indexes}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Input stem={stem} onChange={setStem} />
          <Results stem={stem} />
        </>
      )}
    </Provider>
  );
}
```

Let's go!

```jsx
addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

## The `Input` Component

The search box is a very lightly wrapped `<input>` element that displays the
stem and reacts to changes, firing the `onChange` prop.

```jsx
const Input = ({stem, onChange}) => (
  <input
    value={stem}
    onChange={useCallback(({target: {value}}) => onChange(value), [])}
    placeholder="Search for a word"
    autoFocus={true}
    spellCheck={false}
  />
);
```

We have a little bit of styling for this too:

```less
input {
  border: 0;
  border-bottom: 1px solid #999;
  display: block;
  font: inherit;
  letter-spacing: inherit;
  font-weight: 600;
  margin: 1rem auto;
  outline: 0;
  padding: 0;
  width: 20rem;
}
```

## The `Results` Component

Since we did all the hard work up front to index the corpus of words, fetching
the results is trivial! We take the stem, get the array of Row Ids that are in
that pre-indexed Slice, and then render a `Result` component for the first 14 of
them:

```jsx
const Results = ({stem}) => {
  const resultRowIds = useSliceRowIds('stems', stem.toLowerCase());
  return (
    resultRowIds.length > 0 &&
    resultRowIds
      .slice(0, 14)
      .map((rowId) => <Result rowId={rowId} stemLength={stem.length} />)
  );
};
```

Why 14? That's the number that seems to fit neatly in the window above. But
there is very little performance impact to having a much larger result list if
you wish.

We pass down the `stemLength` prop simply so each `Result` row can embolden the
matching characters.

### The `Result` Component

For each matching word (identified by its Row Id in the `words` Table of the
default Store), we want to display the word, its rank, and its frequency:

```jsx
const Result = ({rowId, stemLength}) => {
  const {rank, word, perMillion} = useRow('words', rowId);
  return (
    <div className="result">
      <b>{word.substring(0, stemLength)}</b>
      {word.substring(stemLength)}
      <small>
        <b>
          {rank}
          {suffix(rank)}
        </b>
        , {frequency(perMillion)}
      </small>
    </div>
  );
};
```

We style this:

```less
.result {
  display: block;
  width: 20rem;
  margin: 0.25rem auto;
  small {
    float: right;
    color: #777;
    font-size: 0.7rem;
  }
}
```

The `suffix` function simply puts the ordinal suffixes '-th', '-st',
'-nd', and '-rd' at the end of the ranking number:

```js
const suffix = (rank) => {
  switch (rank % 100) {
    case 11:
    case 12:
    case 13:
      return 'th';
  }
  switch (rank % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};
```

And the frequency function takes the number of times the word typically appears per
million words and displays a percentage:

```js
const frequency = (perMillion) => {
  if (perMillion < 10) {
    return 'rare';
  }
  return (perMillion / 10000).toFixed(3) + '%';
};
```

## `Loading` Component And App Styling

Just for completeness, here is the loading spinner, a plain element with some
CSS.

```jsx
const Loading = () => <div id="loading" />;
```

This is styled as a 270° arc with a spinning animation:

```less
#loading {
  animation: spin 1s infinite linear;
  height: 2rem;
  margin: 40vh auto;
  width: 2rem;
  &::before {
    content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="2rem" viewBox="0 0 100 100"><path d="M50 10A40 40 0 1 1 10 50" stroke="black" fill="none" stroke-width="4" /></svg>');
  }
}

@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
```

And finally, for completeness, here is the remaining styling for the application
as whole:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  color: #333;
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  font-size: 1rem;
  line-height: 1.2rem;
  margin: 0;
  user-select: none;
}
```

## Conclusion

And that's it! This demo hopefully explained how the new multi-Slice indexing
feature in TinyBase v2.1 can be used to create interesting (and high
performance) user experiences with your data.
