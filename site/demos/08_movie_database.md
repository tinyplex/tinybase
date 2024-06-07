# Movie Database

In this demo, we build an app that showcases the relational query capabilities
of TinyBase v2.0, joining together information about movies, directors, and
actors.

![TMDB](https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg 'Inline logo for TMDB') - we use The Movie Database as the source of the movie
information in this app. Thank you for a great data set to demonstrate TinyBase!

## An Overview Of The Data

Before looking at code, let's familiarize ourselves with the data used in this
application.

### Tables

The raw data is loaded into four normalized Table objects: `movies` (the top 250
movies on TMDB), `genres` (the styles of those movies), `people` (actors and
directors), and `cast` (how the actors are associated with the movies).

Naturally, there are relationships between these. For example, the `directorId`
Cell of the `movies` Table references a person in the `people` table, and the
`genreId` Cell references the `genre` Table. The `cast` Table is a many-to-many
join that contains all the `movieId`/`castId` pairs for the top three billed
actors of each movie.

| Table    | Cell Ids                                                                     |
| -------- | ---------------------------------------------------------------------------- |
| `movies` | `id`, `name`, `genreId`, `directorId`, `year`, `rating`, `overview`, `image` |
| `genres` | `id`, `name`                                                                 |
| `people` | `id`, `name`, `gender`, `born`, `died`, `popularity`, `biography`, `image`   |
| `cast`   | `id`, `movieId`, `castId`                                                    |

Because the data is normalized (and fetched as TSV over the wire), it loads
quickly. But generally this data isn't suited to render directly into the
application: the user doesn't want to see the movie's `directorId`. They want to
see the director's `name`!

### Queries

The app therefore uses a set of queries against these underlying Table objects.
These act as de-normalized 'views' of the underlying normalized data and make it
easy for the application to render 'virtual' rows comprised of Cell values from
multiple joined Table objects in the Store.

Some of these, like the main `movies` query, are set up for the lifetime of the
application:

| Query       | From&nbsp;Tables             | Cell Ids                                                                                                                                                                                                                                                    |
| ----------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `movies`    | `movies`, `genres`, `people` | `movieId`, `movieName`, `movieImage`, `year`, `rating`, `genreId`, `genreName`, `overview`, `directorId`, `directorName`, `directorImage`, `castId1`, `castName1`, `castImage1`, `castId2`, `castName2`, `castImage2`, `castId3`, `castName3`, `castImage3` |
| `years`     | `movies`                     | `year`, `movieCount`                                                                                                                                                                                                                                        |
| `genres`    | `movies`                     | `genreId`, `genreName`, `movieCount`                                                                                                                                                                                                                        |
| `directors` | `movies`, `people`           | `directorId`, `directorName`, `directorImage`, `gender`, `popularity`, `movieCount`                                                                                                                                                                         |
| `cast`      | `cast`, `people`             | `castId`, `castName`, `castImage`, `gender`, `popularity`, `movieCount`                                                                                                                                                                                     |

Others, like the `moviesInYear` query, are set up when a specific page is being
viewed (in that case, the detail page for a particular year):

| Query                | From&nbsp;Tables           | Cell Ids                                                                       |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| `moviesInYear`       | `movies`, `genres`         | `movieId`, `movieName`, `movieImage`, `year`, `rating`, `genreId`, `genreName` |
| `moviesInGenre`      | `movies`, `genres`         | `movieId`, `movieName`, `movieImage`, `year`, `rating`, `genreId`, `genreName` |
| `moviesWithDirector` | `movies`, `genres`         | `movieId`, `movieName`, `movieImage`, `year`, `rating`, `genreId`, `genreName` |
| `moviesWithCast`     | `cast`, `movies`, `genres` | `movieId`, `movieName`, `movieImage`, `year`, `rating`, `genreId`, `genreName` |

You might notice that many of these queries share the same Cell Ids. You'll
discover that TinyBase lets you compose queries programmatically, so we'll be
able to build these queries without much repetition: the common
`queryMovieBasics` function is used to select the same Cell Ids into most of
these query views.

Refer back to this section when we start [loading the data](#loading-the-data),
[querying the data](#querying-the-data), and rendering them into the user
interface. Otherwise, that's enough preamble... let's get to some code!

## Boilerplate

As per usual, we first pull in React, ReactDOM, and TinyBase:

```html
<script src="/umd/react.production.min.js"></script>
<script src="/umd/react-dom.production.min.js"></script>
<script src="/umd/tinybase/index.js"></script>
<script src="/umd/tinybase/ui-react/index.js"></script>
<script src="/umd/tinybase/ui-react-dom/index.js"></script>
<script src="/umd/tinybase/ui-react-inspector/index.js"></script>
```

We're using the Inspector component for the purposes of seeing how the data is
structured.

We need the following parts of the TinyBase API, the ui-react module, and React
itself:

```js
const {createQueries, createStore} = TinyBase;
const {
  CellView,
  Provider,
  ResultCellView,
  useCell,
  useCreateQueries,
  useCreateStore,
  useQueries,
  useResultCell,
  useResultRowIds,
  useSetValuesCallback,
  useValues,
} = TinyBaseUiReact;
const {createElement, useMemo, useState} = React;
const {Inspector} = TinyBaseUiReactInspector;
const {ResultSortedTableInHtmlTable} = TinyBaseUiReactDom;
```

## Initializing The Application

In the main part of the application, we want to initialize a default Store
(called `store`) and a named Store called `viewStore`. The latter serves the
sole purpose of remembering the 'route' in the application, which describes
which part of the user interface the user is looking at.

We also initialize a Queries object, and use the `createAndInitQueries` function
(which we'll describe later) to set up the queries for the application.

The two Store objects and the Queries object are memoized by the useCreateStore
method and useCreateQueries method so they are only created the first time the
app is rendered.

```jsx
const App = () => {
  const store = useCreateStore(createStore);

  const viewStore = useCreateStore(() =>
    createStore().setValues({currentSection: 'movies'}),
  );

  const queries = useCreateQueries(store, createAndInitQueries, []);
  // ...
```

This application depends on loading data into the main Store the first time it
is rendered. We do this by having an `isLoading` flag in the application's
state, and setting it to `false` only once the asynchronous loading sequence in
the (soon-to-be described) `loadStore` function has completed. Until then, a
loading spinner is shown.

```jsx
  // ...
  const [isLoading, setIsLoading] = useState(true);
  useMemo(async () => {
    await loadStore(store);
    setIsLoading(false);
  }, []);

  return (
    <Provider store={store} storesById={{viewStore}} queries={queries}>
      <Header />
      {isLoading ? <Loading /> : <Body />}
      <Inspector />
    </Provider>
  );
}
```

We also added the Inspector component at the end there so you can inspect
what is going on with the data during this demo. Simply click the TinyBase logo
in the corner.

With simple boilerplate code to load the component, off we go:

```jsx
addEventListener('load', () =>
  ReactDOM.createRoot(document.body).render(<App />),
);
```

## Basic Components

Before we get to the really interesting parts, let's dispense with the basic
building blocks for the application's user interface.

### Loading Spinner

First the loading spinner, a plain element with some CSS.

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

### Application Sections

Next the structure of the application. It has four sections: 'Movies', 'Years',
'Genres', and 'People'. We define their outer components and create a keyed
collection of them. Each either shows an overview (for example, all movies) or
the detail of one particular record (for example, a single movie):

```jsx
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
```

The `viewStore` contains the section name and optionally a string detail ID
(such as the movie's Id), both as Values. The `useRoute` hook gets this pair,
and the `useSetRouteCallback` hook will be used to set it in response to the
user clicking links in the app.

```js
const useRoute = () => useValues('viewStore');
const useSetRouteCallback = (currentSection, currentDetailId) =>
  useSetValuesCallback(
    () => ({currentSection, currentDetailId}),
    [currentSection, currentDetailId],
    'viewStore',
  );
```

Note that we're not doing anything fancy here like updating the browser's URL
address or history state as the user navigates around, but we would add that in
this method if we did.

(Another easy, but interesting, exercise for the reader would be to use the
Checkpoints API on the `viewStore` to create an in-app history stack for the
pages viewed!)

### Application Header

The header component simply renders all the links for the `SECTIONS` object and
highlights the one that matches the current route.

```jsx
const Header = () => {
  const {currentSection} = useRoute();
  return (
    <nav>
      {Object.entries(SECTIONS).map(([section, [title]]) => (
        <a
          className={currentSection == section ? 'current' : ''}
          onClick={useSetRouteCallback(section, null)}
        >
          {title}
        </a>
      ))}
    </nav>
  );
};
```

The header also has very simple styling:

```less
nav {
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
```

### Application Body

Finally, we use the current route to load the appropriate section and render it
into the main part of the application:

```jsx
const Body = () => {
  const {currentSection, currentDetailId} = useRoute();
  if (SECTIONS[currentSection] != null) {
    const [, Section] = SECTIONS[currentSection];
    return (
      <main>
        <Section detailId={currentDetailId} />
      </main>
    );
  }
  return null;
};
```

Again, this component has minimal styling:

```less
main {
  padding: 0.5rem;
}
```

## Loading The Data

We now move onto the more interesting data manipulation and rendering logic in
the application.

The movie data for the application is sourced from TMDB and has been converted
into a tab-separated variable format. TSV files are smaller and faster than JSON
to load over the wire, but nonetheless, we load them asynchronously.

The logic here should be reasonably self-evident. We extract the column names
from the top of the TSV, check each row has a matching cardinality, use the
first column as the Row Id, coerce numeric Cell values, and load everything into
a standard Table.

```js
const NUMERIC = /^[\d\.]+$/;

const loadTable = async (store, tableId) => {
  const rows = (
    await (await fetch(`https://tinybase.org/assets/${tableId}.tsv`)).text()
  ).split('\n');
  const cellIds = rows.shift().split('\t');
  rows.forEach((row) => {
    const cells = row.split('\t');
    if (cells.length == cellIds.length) {
      const rowId = cells.shift();
      cells.forEach((cell, c) => {
        if (cell != '') {
          if (NUMERIC.test(cell)) {
            cell = parseFloat(cell);
          }
          store.setCell(tableId, rowId, cellIds[c + 1], cell);
        }
      });
    }
  });
};
```

There are four raw tables used in this application, as described in our opening
section. We wait for all four to load (again, asynchronously) wrapped in a
single Store transaction.

```js
const loadStore = async (store) => {
  store.startTransaction();
  await Promise.all(
    ['movies', 'genres', 'people', 'cast'].map((tableId) =>
      loadTable(store, tableId),
    ),
  );
  store.finishTransaction();
};
```

`loadStore` was the function referenced in the [main `App`
component](#initializing-the-application), so once this completes, the data is
loaded and we're ready to go.

## Querying The Data

As described [at the start of this article](#queries), there are a number of
queries that are set up at the beginning of the app and which are used
throughout its lifetime. These include the list of all movies with de-normalized
genre, director, and cast names (a query called `movies`); and queries that
group counts of movies by genre, year, and so on.

Since many queries throughout the app re-use the same set of fields - such as
movie name, image, year, and genre - we can first create a re-usable function
that specifies those Cell Ids. This can be used whenever the `movies` Table is
the root of the query. When provided a `select` and `join` function, it selects
those common columns:

```js
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
```

Notice that we use a convention in this app of suffixing `Id`, `Name` and
`Image` to resulting Cell Ids.

In the `App` component we described at the start of the article, we call a
function called `createAndInitQueries` to initialize the queries. Here's its
implementation:

```js
const createAndInitQueries = (store) => {
  const queries = createQueries(store);
  // ...
```

First we define the `movies` query that populates the main overview of the
movies section of the app, and provides the detail about the movie's overview,
directors and cast.

The join to the `people` Table for the director name and image should be
self-explanatory. What is slightly more interesting is the way we join to get
the cast names and images. Each movie has up to three cast members captured in
the `cast` many-to-many join Table - and so we join through _that_ table three
times according to their billing.

```js
// ...
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
    const actorJoin = `actors${billing}`;
    join('people', castJoin, 'castId').as(actorJoin);
    select(actorJoin, 'name').as(`castName${billing}`);
    select(actorJoin, 'image').as(`castImage${billing}`);
  });
});
// ...
```

For the SQL-inclined amongst you, we've created something more or less
equivalent to the following query:

```sql
-- movies query
SELECT
  movies._rowId AS movieId,
  movies.name AS movieName,
  movies.image AS movieImage,
  movies.year AS year,
  movies.rating AS rating,
  movies.genreId AS genreId,
  genres.name AS genreName,
  movies.overview AS overview,
  movies.directorId AS directorId,
  directors.name AS directorName,
  directors.image AS directorImage,
  cast1.castId AS castId1,
  actors1.name AS castName1,
  actors1.image AS castImage1,
  cast2.castId AS castId2,
  actors2.name AS castName2,
  actors2.image AS castImage2,
  cast3.castId AS castId3,
  actors3.name AS castName3,
  actors3.image AS castImage3
FROM
  movies
    LEFT JOIN genres
      ON genres._rowId = movies.genreId
    LEFT JOIN people AS directors
      ON directors._rowId = movies.directorId
    LEFT JOIN cast AS cast1
      ON cast1._rowId = CONCAT(movies.movieId, '/1')
      LEFT JOIN people AS actors1
        ON actors1._rowId = cast1.castId
    LEFT JOIN cast AS cast2
      ON cast2._rowId = CONCAT(movies.movieId, '/2')
      LEFT JOIN people AS actors2
        ON actors2._rowId = cast2.castId
    LEFT JOIN cast AS cast3
      ON cast3._rowId = CONCAT(movies.movieId, '/3')
      LEFT JOIN people AS actors3
        ON actors3._rowId = cast3.castId
```

(Except the results in our case are reactive - not something you usually get to
benefit from with a SQL-based database!)

We also create query definitions for the other persistent queries. These use the
`group` function to count the number of movies per year, genre, and so on, used
in the overview components of each of the main sections of the app.

```js
  // ...
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
}
```

That's it for the main persistent queries that power most of the major views of
the app. We'll refer to these by their query Id when we actually bind them to
components.

## The ResultSortedTableInHtmlTable Component

Most of the movies app is built from tabular data views, and it's nice to have a
re-usable `<table>` rendering, complete with sorting, pagination, and
formatting.

Previously there was a whole table implementation in this demo, but as of
TinyBase v4.1, we just use the ResultSortedTableInHtmlTable component from the
new ui-react-dom module straight out of the box! You'll see we use it throughout
the app.

This component also benefits from some light styling for the pagination buttons
and the table itself:

```less
table {
  border-collapse: collapse;
  font-size: inherit;
  line-height: inherit;
  margin-top: 0.5rem;
  table-layout: fixed;
  width: 100%;
  caption {
    text-align: left;
    button {
      border: 0;
      margin-right: 0.25rem;
    }
  }
  th,
  td {
    padding: 0.25rem 0.5rem 0.25rem 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  th {
    border: solid #ddd;
    border-width: 1px 0;
    cursor: pointer;
    text-align: left;
    width: 20%;
    &:nth-child(1) {
      width: 40%;
    }
  }
  td {
    border-bottom: 1px solid #eee;
  }
}
```

## Linking Between Views

Throughout the app, if you click on a movie name (wherever you see it), we'll
want to take you to the movie detail. Clicking a year should take you to the
list of movies for the year, a genre to the list of movies in a genre - and so
on.

For example, the `MovieLink` component creates a link that sets the route to be
the `movies` section, with the value of the `movieId` Cell from the result Row
being rendered. The `ImageFromQuery` component we'll discuss later.

Here we create a collection of tiny custom components which, when passed a
`queryId` and `rowId` can render a decorated link which, when clicked, update
the application's route. We will be using these in the customCell props of the
`ResultSortedTableInHtmlTable` instances to configure them as custom cell
renderers.

This component obviously assumes that the `movieId`, `movieImage`, and
`movieName` Cell Ids are present in the query, so we only use this for queries
that meaningfully populate those.

```jsx
const MovieLink = ({queryId, rowId}) => {
  const movieId = useResultCell(queryId, rowId, 'movieId');
  return (
    <a onClick={useSetRouteCallback('movies', movieId)}>
      <ImageFromQuery queryId={queryId} rowId={rowId} cellId="movieImage" />
      <ResultCellView queryId={queryId} rowId={rowId} cellId="movieName" />
    </a>
  );
};
```

We do the same for queries that contain a `year` Cell Id, for those that contain
`genreId` and `genreName` Cell Ids, and for those that contain `directorId` and
`directorName` Cell Ids:

```jsx
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
```

We do the same for actors, but for the billed cast members we need to check tor
existence, in case a movie does not have three actors:

```jsx
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
```

## Helper Components

Throughout the app, we'll use a few simple helper components. Let's get them
defined up front.

These take the numeric TMDB gender Id (from the Row of a Table or the result Row
of query) and render it as a string:

```jsx
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
```

These take a TMDB image path (again from the Row of a Table or the result Row of
query) and render it in large or small format:

```jsx
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
```

These images have some light styling:

```less
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
```

And finally, this trivial component just wraps the main view of the application
to apply a consistent title to the top of each page:

```jsx
const Page = ({title, children}) => (
  <>
    <h1>{title}</h1>
    {children}
  </>
);
```

With these helper components out of the way, let's move on to the main parts of
the app.

## Overview Components

We now use the ResultSortedTableInHtmlTable component and these linker
components to create the major views of the application.

First, the overview of all the rated movies in the database (which displays on
the 'Movies' tab when the app first loads), comprising a
`ResultSortedTableInHtmlTable` that renders the `movies` query with four
columns, sorted by rating.

```jsx
const MoviesOverview = () => (
  <Page title="Rated movies">
    <ResultSortedTableInHtmlTable
      queryId="movies"
      customCells={customCellsForMoviesOverview}
      cellId="rating"
      descending={true}
      limit={20}
      sortOnClick={true}
      paginator={true}
      idColumn={false}
    />
  </Page>
);

const customCellsForMoviesOverview = {
  movieName: {label: 'Movie', component: MovieLink},
  year: {label: 'Year', component: YearLink},
  rating: {label: 'Rating'},
  genreName: {label: 'Genre', component: GenreLink},
};
```

Note how three of the columns are given a custom component to render the value
not as raw text but as a link. We'll describe [those simple
components](#linking-between-views) later.

The 'Years' tab renders the `years` query with two columns: the year and the
number of movies in that year:

```jsx
const YearsOverview = () => (
  <Page title="Years">
    <ResultSortedTableInHtmlTable
      queryId="years"
      customCells={customCellsForYearsOverview}
      cellId="year"
      limit={20}
      descending={true}
      sortOnClick={true}
      paginator={true}
      idColumn={false}
    />
  </Page>
);

const customCellsForYearsOverview = {
  year: {label: 'Year', component: YearLink},
  movieCount: {label: 'Rated movies'},
};
```

Similarly, the 'Genres' tab renders the `genres` query with two columns: the
genre and the number of movies in that genre:

```jsx
const GenresOverview = () => (
  <Page title="Genres">
    <ResultSortedTableInHtmlTable
      queryId="genres"
      customCells={customCellsForGenresOverview}
      cellId="movieCount"
      descending={true}
      limit={20}
      sortOnClick={true}
      paginator={true}
      idColumn={false}
    />
  </Page>
);

const customCellsForGenresOverview = {
  genreName: {label: 'Genre', component: GenreLink},
  movieCount: {label: 'Rated movies'},
};
```

Finally, the 'People' tab renders two tables: the `directors` query and the
`cast` query with four columns each, both sorted by popularity:

```jsx
const PeopleOverview = () => (
  <Page title="People">
    <h2>Directors</h2>
    <ResultSortedTableInHtmlTable
      queryId="directors"
      customCells={customCellsForDirectorsOverview}
      cellId="popularity"
      descending={true}
      limit={20}
      sortOnClick={true}
      paginator={true}
      idColumn={false}
    />
    <h2>Cast</h2>
    <ResultSortedTableInHtmlTable
      queryId="cast"
      customCells={customCellsForCastOverview}
      cellId="popularity"
      descending={true}
      limit={20}
      sortOnClick={true}
      paginator={true}
      idColumn={false}
    />
  </Page>
);

const customCellsForDirectorsOverview = {
  directorName: {label: 'Director', component: DirectorLink},
  gender: {label: 'Gender', component: GenderFromQuery},
  popularity: {label: 'Popularity'},
  movieCount: {label: 'Rated movies'},
};

const customCellsForCastOverview = {
  castName: {label: 'Cast', component: CastLink},
  gender: {label: 'Gender', component: GenderFromQuery},
  popularity: {label: 'Popularity'},
  movieCount: {label: 'Rated movies'},
};
```

Click through each of the section headings in the app so you can see how each of
these is working.

## Detail Components

We also have a detail view for each section, which drills into a specific movie,
year, genre, or person. Firstly, for a single movie (assuming it exists!), we
isolate a row in the de-normalized `movies` query and render its Cell values in
a page format:

```jsx
const MovieDetail = ({movieId}) => {
  const props = {queryId: 'movies', rowId: movieId};
  const name = useResultCell('movies', movieId, 'movieName');
  return name == null ? null : (
    <Page title={name}>
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
```

Again, note how we are often using custom components that take the Cell values
from this result Row to make links to other parts of the app. We'll describe
those shortly.

Moving on, the detail for a specific year is just a sorted table of the movies
from that year.

But here is a case where we need to run the query within the component (rather
than globally across the app). The `moviesInYear` query is constructed whenever
the `year` prop changes, and uses the `where` function to show the basic movie
data for just those movies matching that year. We get to benefit from the
`queryMovieBasics` function again since we just need movie Id, name, rating and
genre.

```jsx
const YearDetail = ({year}) => {
  const queries = useQueries();
  useMemo(
    () =>
      queries.setQueryDefinition(
        'moviesInYear',
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
      <ResultSortedTableInHtmlTable
        queryId="moviesInYear"
        customCells={customCellsForMoviesInYear}
        cellId="rating"
        descending={true}
        limit={20}
        sortOnClick={true}
        paginator={true}
        idColumn={false}
      />
    </Page>
  );
};

const customCellsForMoviesInYear = {
  movieName: {label: 'Movie', component: MovieLink},
  rating: {label: 'Rating'},
  genreName: {label: 'Genre', component: GenreLink},
};
```

The genre detail page is very similar, with a `where` clause to match the
genre's Id:

```jsx
const GenreDetail = ({genreId}) => {
  const queries = useQueries();
  useMemo(
    () =>
      queries.setQueryDefinition(
        'moviesInGenre',
        'movies',
        ({select, join, where}) => {
          queryMovieBasics({select, join});
          where('genreId', genreId);
        },
      ),
    [genreId],
  );
  const name = useCell('genres', genreId, 'name');
  return name == null ? null : (
    <Page title={`${name} movies`}>
      <ResultSortedTableInHtmlTable
        queryId="moviesInGenre"
        customCells={customCellsForMoviesInGenre}
        cellId="rating"
        descending={true}
        limit={20}
        sortOnClick={true}
        paginator={true}
        idColumn={false}
      />
    </Page>
  );
};

const customCellsForMoviesInGenre = {
  movieName: {label: 'Movie', component: MovieLink},
  year: {label: 'Year', component: YearLink},
  rating: {label: 'Rating'},
};
```

Finally, we build the detail page for a person. We create two queries on the fly
here, one for those movies for which the person is the director, and one for
those in which they are cast.

The latter is slightly more complex since it needs to use the many-to-many
`cast` Table as its root, from where it joins to the `movies` Table and `genres`
Table in turn. Nevertheless, the result Cell Ids are named to be consistent with
the other queries, so that we can use the same custom components to render each
part of the HTML table.

This component is also slightly more complex that the others because it is also
rendering some parts of its content directly from the `people` Table (rather
than via a query) - hence the use of the basic `useCell` hook and `CellView`
component, for example.

```jsx
const PersonDetail = ({personId}) => {
  const queries = useQueries();
  useMemo(
    () =>
      queries
        .setQueryDefinition(
          'moviesWithDirector',
          'movies',
          ({select, join, where}) => {
            queryMovieBasics({select, join});
            where('directorId', personId);
          },
        )
        .setQueryDefinition(
          'moviesWithCast',
          'cast',
          ({select, join, where}) => {
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
          },
        ),
    [personId],
  );

  const props = {tableId: 'people', rowId: personId};
  const name = useCell('people', personId, 'name');
  const died = useCell('people', personId, 'died');
  const moviesWithDirector = useResultRowIds('moviesWithDirector');
  const moviesWithCast = useResultRowIds('moviesWithCast');

  return name == null ? null : (
    <Page title={name}>
      <ImageFromTable {...props} cellId="image" isLarge={true} />
      <ul>
        <li>
          Gender: <GenderFromTable {...props} />
        </li>
        <li>
          Born: <CellView {...props} cellId="born" />
          {died && (
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

      {moviesWithDirector.length == 0 ? null : (
        <>
          <h2>As director:</h2>
          <ResultSortedTableInHtmlTable
            queryId="moviesWithDirector"
            customCells={customCellsForMoviesWithPeople}
            cellId="rating"
            descending={true}
            limit={20}
            sortOnClick={true}
            paginator={true}
            idColumn={false}
          />
        </>
      )}

      {moviesWithCast.length == 0 ? null : (
        <>
          <h2>As cast:</h2>
          <ResultSortedTableInHtmlTable
            queryId="moviesWithCast"
            customCells={customCellsForMoviesWithPeople}
            cellId="rating"
            descending={true}
            limit={20}
            sortOnClick={true}
            paginator={true}
            idColumn={false}
          />
        </>
      )}
    </Page>
  );
};

const customCellsForMoviesWithPeople = {
  movieName: {label: 'Movie', component: MovieLink},
  year: {label: 'Year', component: YearLink},
  rating: {label: 'Rating'},
  genreName: {label: 'Genre', component: GenreLink},
};
```

## Default Styling

Just for completeness, here is the default CSS styling and typography that the
app uses:

```less
@font-face {
  font-family: Inter;
  src: url(https://tinybase.org/fonts/inter.woff2) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  user-select: none;
  font-family: Inter, sans-serif;
  letter-spacing: -0.04rem;
  font-size: 0.8rem;
  line-height: 1.5rem;
  margin: 0;
  color: #333;
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
```

## Conclusion

And that's it! There is quite a lot going on here, but this is arguably a
complete and legitimate application that pulls in a decent amount of normalized
relational data and renders it in a useful and navigable fashion.

One thing that might be easy to forget (because the movie data does not change)
is that every single view rendered in this application is reactive! Were any
aspect of the data dynamic, it would be automatically updated in the user
interface. It's left as an exercise to the reader to explore how this might
work, perhaps with movie favorite lists, or pulling dynamic data directly from
TMDB.

In the meantime, as they say in the movies, that's a wrap!
