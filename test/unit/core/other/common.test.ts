import {getHlcFunctions} from 'tinybase';

test('getHlcFunctions', () => {
  const result = getHlcFunctions();
  expect(result.length).toEqual(7);
});
