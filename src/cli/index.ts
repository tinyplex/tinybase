#! /usr/bin/env node

import type {TablesSchema, ValuesSchema} from '../@types/store/index.d.ts';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import {UTF8} from '../common/strings.ts';
import {arrayForEach} from '../common/array.ts';
import {createStore} from '../store/index.ts';
import {createTools} from '../tools/index.ts';
import {fileURLToPath} from 'url';
import {isArray} from '../common/other.ts';
import {jsonParse} from '../common/json.ts';
import {objMap} from '../common/obj.ts';

const FILE_ERROR = 'provide a valid schemaFile, storeName, and outputDir';

const log = (...lines: string[]) =>
  arrayForEach(lines, (line) => process.stdout.write(`${line}\n`));

const err = (line: string) => process.stderr.write(`ERROR: ${line}\n`);

const getJson = (file: string) => jsonParse(readFileSync(file, UTF8));

const writeFile = (
  outputDir: string,
  fileName: string,
  content: string,
  label: string,
) => {
  const file = resolve(outputDir, fileName);
  log(label.padStart(23) + ': ' + file);
  writeFileSync(file, content, UTF8);
};

const getTools = (schemaFile: string) => {
  const schema = getJson(schemaFile);
  return createTools(
    createStore().setSchema(
      ...((isArray(schema) ? schema : [schema]) as [
        TablesSchema,
        ValuesSchema,
      ]),
    ),
  );
};

const help = () => {
  log('', 'tinybase <command>', '', 'Usage:', '');
  objMap(commands, ([, args, help], command) =>
    log(` tinybase ${command} ${args}`, ` - ${help}`, ''),
  );
  log('See also http://tinybase.org/guides/developer-tools/command-line/', '');
};

const version = () =>
  log(
    getJson(resolve(dirname(fileURLToPath(import.meta.url)), '../package.json'))
      .version,
  );

const getStoreApi = async (
  schemaFile: string,
  storeName: string,
  outputDir: string,
) => {
  try {
    const [dTs, ts, uiReactDTs, uiReactTsx] =
      await getTools(schemaFile).getPrettyStoreApi(storeName);
    writeFile(outputDir, storeName + '.d.ts', dTs, 'Definition');
    writeFile(outputDir, storeName + '.ts', ts, 'Implementation');
    writeFile(
      outputDir,
      storeName + '-ui-react.d.ts',
      uiReactDTs,
      'UI React definition',
    );
    writeFile(
      outputDir,
      storeName + '-ui-react.tsx',
      uiReactTsx,
      'UI React implementation',
    );
  } catch {
    err(FILE_ERROR);
  }
};

const commands: {
  [command: string]: [
    call: (...args: string[]) => void,
    args: string,
    help: string,
  ];
} = {
  help: [help, '', 'print this message'],
  version: [version, '', 'get the current TinyBase version'],
  getStoreApi: [
    getStoreApi,
    '<schemaFile> <storeName> <outputDir>',
    'generate .d.ts, .ts, and .tsx API files from a schema file',
  ],
};

const main = () => {
  const [, , command, ...args] = process.argv;
  (commands[command]?.[0] ?? help)(...args);
};

main();
