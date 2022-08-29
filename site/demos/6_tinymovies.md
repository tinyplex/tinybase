# TinyMovies

In this demo, we build an app that showcases the relational query capabilities
of TinyBase v2.0, joining together information about movies, directors, and
actors.

![TMDB](https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg 'Inline logo for TMDB') The Movie Database is the source of this data - thank
you for a great data set to demonstrate TinyBase!

## Boilerplate

First, we pull in React, ReactDOM, and TinyBase:

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase.js"></script>
<script src="/umd/ui-react.js"></script>
```

We need the following parts of the TinyBase API, the ui-react module, and React itself:

```js
const {createQueries, createStore} = TinyBase;
const {
  CellView,
  Provider,
  ResultCellView,
  ResultSortedTableView,
  useCell,
  useCreateQueries,
  useCreateStore,
  useQueries,
  useResultCell,
  useResultRowIds,
  useRow,
  useSetRowCallback,
} = TinyBaseUiReact;
const {createElement, useCallback, useMemo, useState} = React;
const {render} = ReactDOM;
```

# Everything Else

Documentation to come shortly. In the meantime, here is the source code.

```jsx
const App = () => {
  const movieStore = useCreateStore(createStore);

  const sessionStore = useCreateStore(() =>
    createStore().setCell('ui', 'route', 'currentSection', 'movies'),
  );

  const queries = useCreateQueries(movieStore, createAndInitQueries, []);

  const [isLoading, setIsLoading] = useState(true);
  useMemo(async () => {
    await loadStore(movieStore);
    setIsLoading(false);
  }, []);

  return (
    <Provider store={movieStore} storesById={{sessionStore}} queries={queries}>
      <Header />
      {isLoading ? <Loading /> : <Body />}
    </Provider>
  );
};

addEventListener('load', () => {
  render(<App />, document.body);
});

const Loading = () => <div id="loading" />;

const Header = () => {
  const {currentSection} = useRoute();
  return (
    <nav id="menu">
      {Object.entries(SECTIONS).map(([section, [title]]) => (
        <a
          class={currentSection == section ? 'current' : ''}
          onClick={useSetRouteCallback(section, null)}
        >
          {title}
        </a>
      ))}
    </nav>
  );
};

const Body = () => {
  const {currentSection, currentDetailId} = useRoute();
  const [, Section] = SECTIONS[currentSection];
  return (
    <main id="body">
      <Section detailId={currentDetailId} />
    </main>
  );
};

const MoviesSection = ({detailId}) =>
  detailId == null ? <MoviesOverview /> : <MovieDetail movieId={detailId} />;

const YearsSection = ({detailId}) =>
  detailId == null ? <YearsOverview /> : <YearDetail year={detailId} />;

const GenresSection = ({detailId}) =>
  detailId == null ? <GenresOverview /> : <GenreDetail genreId={detailId} />;

const PeopleSection = ({detailId}) =>
  detailId == null ? <PeopleOverview /> : <PersonDetail personId={detailId} />;

const SECTIONS = {
  movies: ['Movies', MoviesSection],
  years: ['Years', YearsSection],
  genres: ['Genres', GenresSection],
  people: ['People', PeopleSection],
};

const useRoute = () => useRow('ui', 'route', 'sessionStore');
const useSetRouteCallback = (currentSection, currentDetailId) =>
  useSetRowCallback(
    'ui',
    'route',
    () => ({currentSection, currentDetailId}),
    [currentSection, currentDetailId],
    'sessionStore',
  );

const loadTable = async (store, tableId) => {
  const rows = (
    await (
      await fetch(`https://beta.tinybase.org/assets/${tableId}.tsv`)
    ).text()
  ).split('\n');
  const cellIds = rows.shift().split('\t');
  store.transaction(() =>
    rows.forEach((row) => {
      const cells = row.split('\t');
      if (cells.length == cellIds.length) {
        const rowId = cells.shift();
        cells.forEach((cell, c) => {
          if (cell != '') {
            if (/^[\d\.]+$/.test(cell)) {
              cell = parseFloat(cell);
            }
            store.setCell(tableId, rowId, cellIds[c + 1], cell);
          }
        });
      }
    }),
  );
};

const loadStore = async (store) => {
  store.startTransaction();
  await Promise.all(
    ['movies', 'genres', 'people', 'cast'].map((tableId) =>
      loadTable(store, tableId),
    ),
  );
  store.finishTransaction();
};

const queryMovieBasics = ({select, join}) => {
  select((_, movieId) => movieId).as('movieId');
  select('name').as('movieName');
  select('image').as('movieImage');
  select('year');
  select('rating');
  select('genreId');
  select('genres', 'name').as('genreName');
  join('genres', 'genreId');
};

const createAndInitQueries = (store) => {
  const queries = createQueries(store);

  queries.setQueryDefinition('movies', 'movies', ({select, join}) => {
    queryMovieBasics({select, join});
    select('overview');
    select('directorId');
    select('directors', 'name').as('directorName');
    select('directors', 'image').as('directorImage');
    join('people', 'directorId').as('directors');
    [1, 2, 3].forEach((billing) => {
      const castJoin = `cast${billing}`;
      join('cast', (_, movieId) => `${movieId}/${billing}`).as(castJoin);
      select(castJoin, 'castId').as(`castId${billing}`);
      const peopleJoin = `people${billing}`;
      join('people', castJoin, 'castId').as(peopleJoin);
      select(peopleJoin, 'name').as(`castName${billing}`);
      select(peopleJoin, 'image').as(`castImage${billing}`);
    });
  });

  queries.setQueryDefinition('years', 'movies', ({select, group}) => {
    select('year');
    select((_, rowId) => rowId).as('movieId');
    group('movieId', 'count').as('movieCount');
  });

  queries.setQueryDefinition('genres', 'movies', ({select, join, group}) => {
    select('genreId');
    select((_, rowId) => rowId).as('movieId');
    join('genres', 'genreId');
    select('genres', 'name').as('genreName');
    group('movieId', 'count').as('movieCount');
  });

  queries.setQueryDefinition('directors', 'movies', ({select, join, group}) => {
    select('directorId');
    select((_, rowId) => rowId).as('movieId');
    select('people', 'name').as('directorName');
    select('people', 'image').as('directorImage');
    select('people', 'gender');
    select('people', 'popularity');
    join('people', 'directorId');
    group('movieId', 'count').as('movieCount');
  });

  queries.setQueryDefinition('cast', 'cast', ({select, join, group}) => {
    select('castId');
    select('movieId');
    select('people', 'name').as('castName');
    select('people', 'image').as('castImage');
    select('people', 'gender');
    select('people', 'popularity');
    join('people', 'castId');
    group('movieId', 'count').as('movieCount');
  });

  return queries;
};

const SortedTable = ({
  queryId,
  columns,
  defaultSortCellId,
  defaultDescending = true,
  limit = 20,
  noun = 'record',
}) => {
  const columnsKey = JSON.stringify(columns);

  const [sortCellId, setSortCellId] = useState(defaultSortCellId);
  const [descending, setDescending] = useState(defaultDescending);
  const [offset, setOffset] = useState(0);
  const count = useResultRowIds(queryId).length;

  const Pagination = useCallback(
    () => (
      <>
        {count} {noun}
        {count != 1 ? 's' : ''}
        {count > limit && (
          <>
            {offset > 0 ? (
              <button class="prev" onClick={() => setOffset(offset - limit)} />
            ) : (
              <button class="prev disabled" />
            )}
            {offset + limit < count ? (
              <button class="next" onClick={() => setOffset(offset + limit)} />
            ) : (
              <button class="next disabled" />
            )}
            {offset + 1} to {Math.min(count, offset + limit)}
          </>
        )}
      </>
    ),
    [count, offset, limit],
  );

  const HeadingComponent = useCallback(
    () => (
      <tr>
        {columns.map(([cellId, label], c) =>
          cellId == sortCellId ? (
            <th onClick={() => setDescending(!descending)} class={`col${c}`}>
              {descending ? '\u2193' : '\u2191'} {label}
            </th>
          ) : (
            <th onClick={() => setSortCellId(cellId)} class={`col${c}`}>
              {label}
            </th>
          ),
        )}
      </tr>
    ),
    [sortCellId, descending, columnsKey],
  );

  const RowComponent = useCallback(
    (props) => (
      <tr>
        {columns.map(([cellId, , CellComponent], c) => (
          <td class={`c${c}`}>
            {CellComponent == null ? (
              <ResultCellView {...props} cellId={cellId} />
            ) : (
              <CellComponent {...props} />
            )}
          </td>
        ))}
      </tr>
    ),
    [columnsKey],
  );

  return (
    <>
      <Pagination />
      <table>
        <HeadingComponent />
        <ResultSortedTableView
          queryId={queryId}
          cellId={sortCellId}
          descending={descending}
          offset={offset}
          limit={limit}
          resultRowComponent={RowComponent}
        />
      </table>
    </>
  );
};

const MovieLink = ({queryId, rowId}) => {
  const movieId = useResultCell(queryId, rowId, 'movieId');
  return (
    <a onClick={useSetRouteCallback('movies', movieId)}>
      <ImageFromQuery queryId={queryId} rowId={rowId} cellId="movieImage" />
      <ResultCellView queryId={queryId} rowId={rowId} cellId="movieName" />
    </a>
  );
};

const YearLink = ({queryId, rowId}) => {
  const year = useResultCell(queryId, rowId, 'year');
  return (
    <a onClick={useSetRouteCallback('years', year)}>
      <ResultCellView queryId={queryId} rowId={rowId} cellId="year" />
    </a>
  );
};

const GenreLink = ({queryId, rowId}) => {
  const genreId = useResultCell(queryId, rowId, 'genreId');
  return (
    <a onClick={useSetRouteCallback('genres', genreId)}>
      <ResultCellView queryId={queryId} rowId={rowId} cellId="genreName" />
    </a>
  );
};
const DirectorLink = ({queryId, rowId}) => {
  const personId = useResultCell(queryId, rowId, 'directorId');
  return (
    <a onClick={useSetRouteCallback('people', personId)}>
      <ImageFromQuery queryId={queryId} rowId={rowId} cellId="directorImage" />
      <ResultCellView queryId={queryId} rowId={rowId} cellId="directorName" />
    </a>
  );
};

const CastLink = ({queryId, rowId, billing = ''}) => {
  const personId = useResultCell(queryId, rowId, `castId${billing}`);
  return personId == null ? null : (
    <a onClick={useSetRouteCallback('people', personId)}>
      <ImageFromQuery
        queryId={queryId}
        rowId={rowId}
        cellId={`castImage${billing}`}
      />
      <ResultCellView
        queryId={queryId}
        rowId={rowId}
        cellId={`castName${billing}`}
      />
    </a>
  );
};

const GenderFromQuery = ({queryId, rowId}) =>
  genderString(useResultCell(queryId, rowId, 'gender'));

const GenderFromTable = ({tableId, rowId}) =>
  genderString(useCell(tableId, rowId, 'gender'));

const genderString = (genderId) => {
  switch (genderId) {
    case 1:
      return 'Female';
    case 2:
      return 'Male';
    case 3:
      return 'Non-binary';
    default:
      return 'Unknown';
  }
};

const ImageFromQuery = ({queryId, rowId, cellId, isLarge}) => (
  <Image imageFile={useResultCell(queryId, rowId, cellId)} isLarge={isLarge} />
);

const ImageFromTable = ({tableId, rowId, cellId, isLarge}) => (
  <Image imageFile={useCell(tableId, rowId, cellId)} isLarge={isLarge} />
);

const Image = ({imageFile, isLarge}) => (
  <img
    src={`https://image.tmdb.org/t/p/w${isLarge ? 92 : 45}${imageFile}`}
    className={isLarge ? 'large' : ''}
  />
);

const Page = ({title, children}) => (
  <>
    <h1>{title}</h1>
    {children}
  </>
);

const MoviesOverview = () => (
  <Page title="Rated movies">
    <SortedTable
      queryId="movies"
      columns={[
        ['movieName', 'Movie', MovieLink],
        ['year', 'Year', YearLink],
        ['rating', 'Rating'],
        ['genreName', 'Genre', GenreLink],
      ]}
      defaultSortCellId="rating"
      noun="movie"
    />
  </Page>
);

const MovieDetail = ({movieId}) => {
  const props = {queryId: 'movies', rowId: movieId};
  return (
    <Page title={useResultCell('movies', movieId, 'movieName')}>
      <ImageFromQuery {...props} cellId="movieImage" isLarge={true} />
      <ul>
        <li>
          Year: <YearLink {...props} />
        </li>
        <li>
          Genre: <GenreLink {...props} />
        </li>
        <li>
          Rating: <ResultCellView {...props} cellId="rating" />
        </li>
      </ul>
      <p>
        <ResultCellView {...props} cellId="overview" />
      </p>
      <h2>Credits</h2>
      <ul>
        <li>
          <DirectorLink {...props} />, director
        </li>
        <li>
          <CastLink {...props} billing={1} />
        </li>
        <li>
          <CastLink {...props} billing={2} />
        </li>
        <li>
          <CastLink {...props} billing={3} />
        </li>
      </ul>
    </Page>
  );
};

const YearsOverview = () => (
  <Page title="Years">
    <SortedTable
      queryId="years"
      columns={[
        ['year', 'Year', YearLink],
        ['movieCount', 'Rated movies'],
      ]}
      defaultSortCellId="year"
      noun="year"
    />
  </Page>
);

const YearDetail = ({year}) => {
  useMemo(
    () =>
      useQueries().setQueryDefinition(
        'moviesByYear',
        'movies',
        ({select, join, where}) => {
          queryMovieBasics({select, join});
          where('year', year);
        },
      ),
    [year],
  );
  return (
    <Page title={`Movies from ${year}`}>
      <SortedTable
        queryId="moviesByYear"
        columns={[
          ['movieName', 'Movie', MovieLink],
          ['rating', 'Rating'],
          ['genre', 'Genre', GenreLink],
        ]}
        defaultSortCellId="rating"
        noun="movie"
      />
    </Page>
  );
};

const GenresOverview = () => (
  <Page title="Genres">
    <SortedTable
      queryId="genres"
      columns={[
        ['genreName', 'Genre', GenreLink],
        ['movieCount', 'Rated movies'],
      ]}
      defaultSortCellId="movieCount"
      noun="genre"
    />
  </Page>
);

const GenreDetail = ({genreId}) => {
  useMemo(
    () =>
      useQueries().setQueryDefinition(
        'moviesByGenre',
        'movies',
        ({select, join, where}) => {
          queryMovieBasics({select, join});
          where('genreId', genreId);
        },
      ),
    [genreId],
  );
  return (
    <Page title={`${useCell('genres', genreId, 'name')} movies`}>
      <SortedTable
        queryId="moviesByGenre"
        columns={[
          ['movieName', 'Movie', MovieLink],
          ['year', 'Year', YearLink],
          ['rating', 'Rating'],
        ]}
        defaultSortCellId="rating"
        noun="movie"
      />
    </Page>
  );
};

const PeopleOverview = () => (
  <Page title="People">
    <h2>Directors</h2>
    <SortedTable
      queryId="directors"
      columns={[
        ['directorName', 'Director', DirectorLink],
        ['gender', 'Gender', GenderFromQuery],
        ['popularity', 'Popularity'],
        ['movieCount', 'Rated movies'],
      ]}
      defaultSortCellId="popularity"
      noun="director"
    />
    <h2>Cast</h2>
    <SortedTable
      queryId="cast"
      columns={[
        ['castName', 'Cast', CastLink],
        ['gender', 'Gender', GenderFromQuery],
        ['popularity', 'Popularity'],
        ['movieCount', 'Rated movies'],
      ]}
      defaultSortCellId="popularity"
      noun="actor"
    />
  </Page>
);

const PersonDetail = ({personId}) => {
  useMemo(
    () =>
      useQueries()
        .setQueryDefinition(
          'moviesByDirector',
          'movies',
          ({select, join, where}) => {
            queryMovieBasics({select, join});
            where('directorId', personId);
          },
        )
        .setQueryDefinition('moviesByCast', 'cast', ({select, join, where}) => {
          select('movieId');
          select('movies', 'name').as('movieName');
          select('movies', 'image').as('movieImage');
          select('movies', 'year');
          select('movies', 'rating');
          select('movies', 'genreId');
          select('genres', 'name').as('genreName');
          join('movies', 'movieId');
          join('genres', 'movies', 'genreId');
          where('castId', personId);
        }),
    [personId],
  );
  const props = {tableId: 'people', rowId: personId};
  return (
    <Page title={useCell('people', personId, 'name')}>
      <ImageFromTable {...props} cellId="image" isLarge={true} />
      <ul>
        <li>
          Gender: <GenderFromTable {...props} />
        </li>
        <li>
          Born: <CellView {...props} cellId="born" />
          {useCell('people', personId, 'died') && (
            <>
              ; died: <CellView {...props} cellId="died" />
            </>
          )}
        </li>
        <li>
          Popularity: <CellView {...props} cellId="popularity" />
        </li>
      </ul>
      <p>
        <CellView {...props} cellId="biography" />
      </p>
      {useResultRowIds('moviesByDirector').length == 0 ? null : (
        <>
          <h2>As director:</h2>
          <SortedTable
            queryId="moviesByDirector"
            columns={[
              ['movieName', 'Movie', MovieLink],
              ['year', 'Year', YearLink],
              ['rating', 'Rating'],
            ]}
            defaultSortCellId="rating"
            noun="rated movie"
          />
        </>
      )}
      {useResultRowIds('moviesByCast').length == 0 ? null : (
        <>
          <h2>As cast:</h2>
          <SortedTable
            queryId="moviesByCast"
            columns={[
              ['movieName', 'Movie', MovieLink],
              ['year', 'Year', YearLink],
              ['rating', 'Rating'],
            ]}
            defaultSortCellId="rating"
            noun="rated movie"
          />
        </>
      )}
    </Page>
  );
};
```

```less
@font-face {
  font-family: Lato;
  src: url(https://tinybase.org/fonts/lato-light.woff2) format('woff2');
  font-weight: 400;
}

@font-face {
  font-family: Lato;
  src: url(https://tinybase.org/fonts/lato-regular.woff2) format('woff2');
  font-weight: 600;
}

* {
  box-sizing: border-box;
}

body {
  user-select: none;
  font-family: Lato, sans-serif;
  font-size: 0.8rem;
  line-height: 1.5rem;
  margin: 0;
  color: #333;
}

nav#menu {
  background: #eee;
  display: flex;
  a {
    flex: 1;
    padding: 0.25rem;
    text-align: center;
    &.current {
      background: #ddd;
      font-weight: 600;
    }
  }
}

main#body {
  padding: 0.5rem;
}

h1 {
  margin: 0 0 1rem;
}

h2 {
  margin: 1.5rem 0 0.5rem;
}

ul {
  padding-left: 0;
}

li {
  display: block;
  padding-bottom: 0.25rem;
}

a {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
  max-width: 100%;
  display: inline-block;
  vertical-align: top;
  color: #000;
  &:hover {
    text-decoration: underline;
  }
}

p {
  line-height: 1.2rem;
}

button {
  width: 1rem;
  height: 1rem;
  border: 0;
  padding: 0;
  vertical-align: text-top;
  cursor: pointer;
  &.prev {
    margin-left: 0.5rem;
    &::before {
      content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" fill="black"><path d="M65 20v60l-30-30z" /></svg>');
    }
  }
  &.next {
    margin-right: 0.5rem;
    &::before {
      content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="1rem" viewBox="0 0 100 100" fill="black"><path d="M35 20v60l30-30z" /></svg>');
    }
  }
  &.disabled {
    cursor: default;
    opacity: 0.3;
  }
}

table {
  width: 100%;
  table-layout: fixed;
  font-size: inherit;
  line-height: inherit;
  margin-top: 0.5rem;
  border-collapse: collapse;
  th,
  td {
    padding: 0.25rem 0.5rem 0.25rem 0;
    overflow: hidden;
    white-space: nowrap;
  }
  th {
    cursor: pointer;
    border: solid #ddd;
    border-width: 1px 0;
    text-align: left;
    &.col0 {
      width: 40%;
    }
    &.col1,
    &.col2,
    &.col3 {
      width: 20%;
    }
  }
  td {
    border-bottom: 1px solid #eee;
  }
}

img {
  width: 1rem;
  height: 1.5rem;
  object-fit: cover;
  vertical-align: top;
  margin: 0 0.25rem 0 0;
  &.large {
    width: 4rem;
    height: 6rem;
    margin: 0 0.5rem 1rem 0;
    object-fit: contain;
    float: left;
    + ul + * {
      clear: both;
    }
  }
}

#loading {
  animation: spin 1s infinite linear;
  margin: 40vh auto;
  width: 2rem;
  height: 2rem;
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
