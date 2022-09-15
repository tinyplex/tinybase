import {
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common';

const [startServer, stopServer, expectPage] = getServerFunctions(8801);

beforeAll(startServer);
afterAll(stopServer);

test('movie-database', async () => {
  await expectPage(`/demos/movie-database`);
  await expectedElement('h1', 'Movie Database');

  await expectedFramedElement('h1', 'Rated movies');
  await expectedFramedElement('main', '250 movies');
  await expectedFramedElement('main', '1 to 20');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(1)', 'Godfather');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(2)', '1972');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(3)', '8.7');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(4)', 'Drama');
  await (await expectedFramedElement('th.col0', 'Movie')).click();
  await expectedFramedElement('tr:nth-child(2) td:nth-child(1)', 'Justice');
  await (await expectedFramedElement('th.col0', '↓ Movie')).click();
  await (
    await expectedFramedElement('tr:nth-child(2) td:nth-child(1) a', 'Angry')
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
  await expectedFramedElement('main', '6 movies');
  await (await expectedFramedElement('nav a.current', 'Years')).click();

  await expectedFramedElement('h1', 'Years');
  await expectedFramedElement('main', '78 years');
  await expectedFramedElement('main', '1 to 20');
  await expectProperty(
    await expectedFramedElement('button.prev'),
    'className',
    'prev disabled',
  );
  await expectProperty(
    await expectedFramedElement('button.next'),
    'className',
    'next',
  );
  await (await expectedFramedElement('button.next')).click();
  await (await expectedFramedElement('button.next')).click();
  await (await expectedFramedElement('button.next')).click();
  await expectedFramedElement('main', '61 to 78');
  await expectProperty(
    await expectedFramedElement('button.prev'),
    'className',
    'prev',
  );
  await expectProperty(
    await expectedFramedElement('button.next'),
    'className',
    'next disabled',
  );
  await (
    await expectedFramedElement('tr:nth-child(2) td:nth-child(1) a', '1956')
  ).click();

  await expectedFramedElement('h1', 'Movies from 1956');
  await expectedFramedElement('main', '1 movie');
  await expectedFramedElement('img');
  await (await expectedFramedElement('a', 'Comedy')).click();

  await expectedFramedElement('h1', 'Comedy movies');
  await expectedFramedElement('main', '30 movies');
  await (await expectedFramedElement('nav a.current', 'Genres')).click();

  await expectedFramedElement('h1', 'Genres');
  await expectedFramedElement('main', '16 genres');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(1)', 'Drama');
  await (await expectedFramedElement('nav a', 'People')).click();

  await expectedFramedElement('h1', 'People');
  await expectedFramedElement('h2', 'Directors');
  await expectedFramedElement('main', '179 directors');
  await expectedFramedElement('tr:nth-child(2) td:nth-child(1)', 'Taika');
  await expectedFramedElement('h2', 'Cast');
  await expectedFramedElement('main', '624 actors');
  await (
    await expectedFramedElement('tr:nth-child(2) td:nth-child(1) a', 'Jennifer')
  ).click();
  await expectedFramedElement('li', 'Gender: Female');
}, 10000);
