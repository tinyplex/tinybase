import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {readdirSync} from 'fs';
import tsc from 'typescript';

const {createProgram, getPreEmitDiagnostics, readJsonConfigFile, sys} = tsc;

const dir = dirname(fileURLToPath(import.meta.url));

const testFiles = readdirSync(resolve(dir, 'types'));
test.each(testFiles)('Types', (testFile) => {
  const {options} = tsc.parseJsonSourceFileConfigFileContent(
    readJsonConfigFile('test/tsconfig.json', sys.readFile),
    sys,
    'test',
  );
  const program = createProgram([resolve(dir, 'types', testFile)], options);
  const results = getPreEmitDiagnostics(program);

  results.map((result) => {
    const {file, messageText, start} = result;
    const {line = 0, character = 0} =
      file?.getLineAndCharacterOfPosition(start ?? 0) ?? {};
    expect(
      typeof messageText == 'string' ? messageText : messageText.messageText,
    ).toMatchSnapshot(`${testFile}:${line}:${character}`);
  });
});
