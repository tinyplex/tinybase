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
  const resultText =
    results.length > 0
      ? results
          .map((result) => {
            const {file, messageText, start} = result;
            if (file != null && start != null) {
              const {line, character} =
                file.getLineAndCharacterOfPosition(start);
              return `${line}:${character}\n${JSON.stringify(messageText)}`;
            }
          })
          .join('\n\n')
      : 'OK';
  expect(resultText).toMatchSnapshot();
});
