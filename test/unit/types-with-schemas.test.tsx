import {createStore} from 'tinybase/debug';
import tsc from 'typescript';

const store = createStore();
store.setCell('a', 'b', 'c', []);

//--

test('Types with schemas', () => {
  const {options} = tsc.parseJsonSourceFileConfigFileContent(
    tsc.readJsonConfigFile('test/tsconfig.json', tsc.sys.readFile),
    tsc.sys,
    'test',
  );
  const results = tsc.getPreEmitDiagnostics(
    tsc.createProgram([__filename], options),
  );
  results.map((result) => {
    const {file, messageText, start} = result;
    const {line, character} = file?.getLineAndCharacterOfPosition(
      start ?? 0,
    ) ?? {line: 0, character: 0};
    expect(
      `${line}:${character}\n${JSON.stringify(messageText)}`,
    ).toMatchSnapshot();
  });
});
