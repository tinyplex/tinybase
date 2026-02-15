import {test} from '@playwright/test';
import {
  expectProperty,
  expectedElement,
  expectedFramedElement,
  getServerFunctions,
} from '../common.ts';

const {beforeAll, afterAll} = test;
const [startServer, stopServer, expectPage] = getServerFunctions(8806);

beforeAll(startServer);
afterAll(stopServer);

test('movie-database', async ({page}) => {
  await expectPage(page, `/demos/movie-database`);
  await expectedElement(page, 'h1', 'Movie Database');

  await expectedFramedElement(page, 'h1', 'Rated movies');
  await expectedFramedElement(page, 'main', '250 rows');
  await expectedFramedElement(page, 'main', '1 to 20');
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    'The Godfather',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(2)',
    '1972',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(3)',
    '8.7',
  );
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(4)',
    'Drama',
  );
  await (await expectedFramedElement(page, 'th:nth-child(1)', 'Movie')).click();
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    'Angry',
  );
  await (
    await expectedFramedElement(page, 'th:nth-child(1)', '↑ Movie')
  ).click();
  await expectedFramedElement(
    page,
    'tbody tr:nth-child(1) td:nth-child(1)',
    'Justice',
  );
  await (
    await expectedFramedElement(page, 'th:nth-child(1)', '↓ Movie')
  ).click();
  await (
    await expectedFramedElement(
      page,
      'tbody tr:nth-child(1) td:nth-child(1) a',
      'Angry',
    )
  ).click();

  await expectedFramedElement(page, 'h1', '12 Angry Men');
  await expectedFramedElement(page, 'li', 'Year: 1957');
  await expectedFramedElement(page, 'li', 'Genre: Drama');
  await expectedFramedElement(page, 'li', 'Rating: 8.5');
  await expectedFramedElement(page, 'p', 'prosecution');
  await expectedFramedElement(page, 'li', 'Sidney Lumet, director');
  await (await expectedFramedElement(page, 'li a', 'Martin Balsam')).click();

  await expectedFramedElement(page, 'h1', 'Martin Balsam');
  await expectedFramedElement(page, 'li', 'Gender: Male');
  await expectedFramedElement(page, 'li', 'Born: 1919');
  await expectedFramedElement(page, 'li', 'Popularity: 7');
  await expectedFramedElement(page, 'p', 'character actor');
  await (await expectedFramedElement(page, 'a', '1957')).click();

  await expectedFramedElement(page, 'h1', 'Movies from 1957');
  await expectedFramedElement(page, 'main', '6 rows');
  await (await expectedFramedElement(page, 'nav a.current', 'Years')).click();

  await expectedFramedElement(page, 'h1', 'Years');
  await expectedFramedElement(page, 'main', '78 rows');
  await expectedFramedElement(page, 'main', '1 to 20');
  await expectProperty(
    await expectedFramedElement(page, 'button.previous'),
    'disabled',
    true,
  );
  await expectProperty(
    await expectedFramedElement(page, 'button.next'),
    'disabled',
    false,
  );
  await (await expectedFramedElement(page, 'button.next')).click();
  await (await expectedFramedElement(page, 'button.next')).click();
  await (await expectedFramedElement(page, 'button.next')).click();
  await expectedFramedElement(page, 'main', '61 to 78');
  await expectProperty(
    await expectedFramedElement(page, 'button.previous'),
    'disabled',
    false,
  );
  await expectProperty(
    await expectedFramedElement(page, 'button.next'),
    'disabled',
    true,
  );
  await (
    await expectedFramedElement(
      page,
      'tbody tr:nth-child(1) td:nth-child(1) a',
      '1956',
    )
  ).click();

  await expectedFramedElement(page, 'h1', 'Movies from 1956');
  await expectedFramedElement(page, 'main', '1 row');
  await expectedFramedElement(page, 'img');
  await (await expectedFramedElement(page, 'a', 'Comedy')).click();
});
