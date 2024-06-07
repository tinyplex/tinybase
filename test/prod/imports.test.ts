import {readdirSync} from 'fs';
import {resolve} from 'path';
import tsc from 'typescript';

const {createProgram, getPreEmitDiagnostics, readJsonConfigFile, sys} = tsc;

const dir = __dirname;

const testFiles = readdirSync(dir).filter(
  (file) => !file.includes('.test.') && !file.includes('__snapshots__'),
);
test.each(testFiles)('Imports', (testFile) => {
  const {options} = tsc.parseJsonSourceFileConfigFileContent(
    readJsonConfigFile('./test/tsconfig.json', sys.readFile),
    sys,
    'test',
  );
  const program = createProgram([resolve(dir, testFile)], options);
  const results = getPreEmitDiagnostics(program).map(
    ({messageText}) => messageText,
  );

  expect(results).toEqual([]);
});
