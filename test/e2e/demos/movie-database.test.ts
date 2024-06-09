import {
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('movie-database', async () => {
  await expectPage(`/demos/movie-database`);
  await expectedElement('h1', 'Movie Database');

  await expectedFramedElement('h1', 'Rated movies');
  await expectedFramedElement('main', '250 rows');
  await expectedFramedElement('main', '1 to 20');
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(1)',
    'The Godfather',
  );
  await expectedFramedElement('tbody tr:nth-child(1) td:nth-child(2)', '1972');
  await expectedFramedElement('tbody tr:nth-child(1) td:nth-child(3)', '8.7');
  await expectedFramedElement('tbody tr:nth-child(1) td:nth-child(4)', 'Drama');
  await (await expectedFramedElement('th:nth-child(1)', 'Movie')).click();
  await expectedFramedElement('tbody tr:nth-child(1) td:nth-child(1)', 'Angry');
  await (await expectedFramedElement('th:nth-child(1)', '↑ Movie')).click();
  await expectedFramedElement(
    'tbody tr:nth-child(1) td:nth-child(1)',
    'Justice',
  );
  await (await expectedFramedElement('th:nth-child(1)', '↓ Movie')).click();
  await (
    await expectedFramedElement(
      'tbody tr:nth-child(1) td:nth-child(1) a',
      'Angry',
    )
  ).click();

  await expectedFramedElement('h1', '12 Angry Men');
  await expectedFramedElement('li', 'Year: 1957');
  await expectedFramedElement('li', 'Genre: Drama');
  await expectedFramedElement('li', 'Rating: 8.5');
  await expectedFramedElement('p', 'prosecution');
  await expectedFramedElement('li', 'Sidney Lumet, director');
  await (await expectedFramedElement('li a', 'Martin Balsam')).click();

  await expectedFramedElement('h1', 'Martin Balsam');
  await expectedFramedElement('li', 'Gender: Male');
  await expectedFramedElement('li', 'Born: 1919');
  await expectedFramedElement('li', 'Popularity: 7');
  await expectedFramedElement('p', 'character actor');
  await (await expectedFramedElement('a', '1957')).click();

  await expectedFramedElement('h1', 'Movies from 1957');
  await expectedFramedElement('main', '6 rows');
  await (await expectedFramedElement('nav a.current', 'Years')).click();

  await expectedFramedElement('h1', 'Years');
  await expectedFramedElement('main', '78 rows');
  await expectedFramedElement('main', '1 to 20');
  await expectProperty(
    await expectedFramedElement('button.previous'),
    'disabled',
    true,
  );
  await expectProperty(
    await expectedFramedElement('button.next'),
    'disabled',
    false,
  );
  await (await expectedFramedElement('button.next')).click();
  await (await expectedFramedElement('button.next')).click();
  await (await expectedFramedElement('button.next')).click();
  await expectedFramedElement('main', '61 to 78');
  await expectProperty(
    await expectedFramedElement('button.previous'),
    'disabled',
    false,
  );
  await expectProperty(
    await expectedFramedElement('button.next'),
    'disabled',
    true,
  );
  await (
    await expectedFramedElement(
      'tbody tr:nth-child(1) td:nth-child(1) a',
      '1956',
    )
  ).click();

  await expectedFramedElement('h1', 'Movies from 1956');
  await expectedFramedElement('main', '1 row');
  await expectedFramedElement('img');
  await (await expectedFramedElement('a', 'Comedy')).click();

  await expectedFramedElement('h1', 'Comedy movies');
  await expectedFramedElement('main', '30 rows');
  await (await expectedFramedElement('nav a.current', 'Genres')).click();

  await expectedFramedElement('h1', 'Genres');
  await expectedFramedElement('main', '16 rows');
  await expectedFramedElement('tbody tr:nth-child(1) td:nth-child(1)', 'Drama');
  await (await expectedFramedElement('nav a', 'People')).click();

  await expectedFramedElement('h1', 'People');
  await expectedFramedElement('h2', 'Directors');
  await expectedFramedElement('main', '179 rows');
  await expectedFramedElement('tbody tr:nth-child(1) td:nth-child(1)', 'Taika');
  await expectedFramedElement('h2', 'Cast');
  await expectedFramedElement('main', '624 rows');
  await (
    await expectedFramedElement(
      'tbody tr:nth-child(1) td:nth-child(1) a',
      'Jennifer',
    )
  ).click();
  await expectedFramedElement('li', 'Gender: Female');
}, 10000);
