import {readdirSync} from 'fs';
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
  (file) => !file.includes('.test.') && !file.includes('__snapshots__'),
);

test.each(testFiles)('Types in %s', (testFile) => {
  const program = createProgram([resolve(dir, testFile)], options);
  const results = getPreEmitDiagnostics(program);

  results.map((result) => {
    const {file, messageText, start} = result;
    const {line = 0, character = 0} =
      file?.getLineAndCharacterOfPosition(start ?? 0) ?? {};
    expect(
      typeof messageText == 'string' ? messageText : messageText.messageText,
    ).toMatchSnapshot(`${line}:${character}`);
  });
});
