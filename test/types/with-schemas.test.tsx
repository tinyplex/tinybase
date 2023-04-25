import tsc, {
  createProgram,
  getPreEmitDiagnostics,
  readJsonConfigFile,
  sys,
} from 'typescript';
import {resolve} from 'path';

const testFiles = ['store'];

test.each(testFiles)('Types', (testFile) => {
  const {options} = tsc.parseJsonSourceFileConfigFileContent(
    readJsonConfigFile('test/tsconfig.json', sys.readFile),
    sys,
    'test',
  );
  const program = createProgram(
    [resolve(__dirname, `program/${testFile}`)],
    options,
  );
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
