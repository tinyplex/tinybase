/* eslint-disable @typescript-eslint/ban-ts-comment, jest/no-export */
import type {Row, Table, Tables, Values} from 'tinybase';
import {blue, plot, red, yellow} from 'asciichart';
import {performance} from 'perf_hooks';

export const repeat = (
  name: string,
  noun: string,
  unit: string,
  actions: (N: number, stepSize: number) => [number, number],
  maxResult: number,
  before?: () => void,
  maxN?: number,
  steps?: number,
): void => {
  test(`${name}`, () => {
    if (before != null) {
      before();
    }

    if (maxN == null) {
      maxN = 10000;
    }

    if (steps == null) {
      steps = 40;
    }

    const stepSize = maxN / steps;
    const runs = [];
    for (let N = stepSize; N <= maxN; N += stepSize) {
      runs.push(N);
    }

    let totalDuration = 0;
    let totalCount = 0;

    const results = runs.map((N) => {
      const [duration, count] = actions(N, stepSize);
      totalDuration += duration;
      totalCount += count;
      return parseFloat((duration / count).toFixed(2));
    });

    const average = parseFloat((totalDuration / totalCount).toFixed(2));
    const averages = new Array(steps).fill(average);
    const maxes = new Array(steps).fill(maxResult);

    // eslint-disable-next-line no-console
    console.log(
      `${name} with multiple ${noun}, ${unit}\n` +
        ` From: ${stepSize} ${noun}\n` +
        `   To: ${maxN} ${noun}\n` +
        `First: ${results[0]} ${unit}\n` +
        ` Last: ${results[results.length - 1]} ${unit}\n` +
        `  Min: ${Math.min(...results)} ${unit}\n` +
        `  Max: ${Math.max(...results)} ${unit}\n` +
        `  Avg: ${average} ${unit}\n\n` +
        // @ts-ignore
        `${plot([maxes, averages, results], {
          height: 15,
          min: 0,
          max: maxResult,
          colors: [red, blue, yellow],
        })}\n`,
    );

    expect(average).toBeLessThan(maxResult);
  });
};

export const repeatRows = (
  name: string,
  actions: (n: number) => void,
  maxResult: number,
  before?: () => void,
): void => {
  repeat(
    name,
    'row count',
    'µs per row',
    (N, stepSize) => [
      µs(() => {
        for (let n = N - stepSize; n <= N; n++) {
          actions(n);
        }
      }),
      stepSize,
    ],
    maxResult,
    before,
  );
};

export const µs = (actions: () => void): number => {
  const start = performance.now();
  actions();
  return 1000 * (performance.now() - start);
};

export const getNTables = (N: number): Tables => {
  const tables: Tables = {};
  for (let n = 1; n <= N; n++) {
    tables['table' + n] = {row: {cell: n}};
  }
  return tables;
};

export const getNRows = (N: number): Table => {
  const table: Table = {};
  for (let n = 1; n <= N; n++) {
    table['row' + n] = {cell: n};
  }
  return table;
};

export const getNCells = (N: number): Row => {
  const row: Row = {};
  for (let n = 1; n <= N; n++) {
    row['cell' + n] = n;
  }
  return row;
};

export const getNValues = (N: number): Values => {
  const values: Values = {};
  for (let n = 1; n <= N; n++) {
    values['value' + n] = n;
  }
  return values;
};
