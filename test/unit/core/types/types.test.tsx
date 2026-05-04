import {readFileSync, readdirSync} from 'fs';
import {resolve} from 'path';
import tsc from 'typescript';
import {expect, test} from 'vitest';

const {createProgram, getPreEmitDiagnostics, readJsonConfigFile, sys} = tsc;

const dir = __dirname;

const {options} = tsc.parseJsonSourceFileConfigFileContent(
  readJsonConfigFile('./test/tsconfig.json', sys.readFile),
  sys,
  'test',
);

const testFiles = readdirSync(dir).filter(
  (file) =>
    !file.includes('.test.') &&
    !file.includes('__snapshots__') &&
    /\.[tj]sx?$/.test(file),
);

const getExpectedErrorLines = (testFile: string): Set<number> =>
  new Set(
    readFileSync(resolve(dir, testFile), 'utf8')
      .split('\n')
      .map((line, lineNumber) =>
        line.includes('// !') || line.includes('{/* ! */}')
          ? lineNumber
          : undefined,
      )
      .filter((lineNumber) => lineNumber != null),
  );

test.each(testFiles)('Types in %s', (testFile) => {
  const testFilePath = resolve(dir, testFile);
  const program = createProgram([testFilePath], options);
  const results = getPreEmitDiagnostics(program);
  const expectedErrorLines = getExpectedErrorLines(testFile);
  const actualErrorLines = new Set<number>();

  results.map((result) => {
    const {file, messageText, start} = result;
    const {line = 0, character = 0} =
      file?.getLineAndCharacterOfPosition(start ?? 0) ?? {};
    if (file?.fileName == testFilePath) {
      actualErrorLines.add(line);
    }
    expect(
      typeof messageText == 'string' ? messageText : messageText.messageText,
    ).toMatchSnapshot(`${line}:${character}`);
  });

  expect(
    [...actualErrorLines].filter((line) => !expectedErrorLines.has(line)),
    'Type errors must be marked with `// !` or `{/* ! */}`',
  ).toEqual([]);
  expect(
    [...expectedErrorLines].filter((line) => !actualErrorLines.has(line)),
    '`// !` and `{/* ! */}` markers must have matching type errors',
  ).toEqual([]);
});
