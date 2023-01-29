#! /usr/bin/env node

import {TablesSchema, ValuesSchema} from './store.d';
import {dirname, resolve} from 'path';
import {isArray, jsonParse} from './common/other';
import {readFileSync, writeFileSync} from 'fs';
import {UTF8} from './common/strings';
import {arrayForEach} from './common/array';
import {createStore} from './tinybase';
import {createTools} from './tools';
import {fileURLToPath} from 'url';
import {objMap} from './common/obj';

type Schemas = [TablesSchema, ValuesSchema | undefined];

const log = (...lines: string[]) =>
  arrayForEach(lines, (line) => process.stdout.write(`${line}\n`));

const err = (line: string) => process.stderr.write(`ERROR: ${line}\n`);

const getJson = (file: string) => jsonParse(readFileSync(file, UTF8));

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
    const schema = getJson(schemaFile);
    const tools = createTools(
      createStore().setSchema(
        ...((isArray(schema) ? schema : [schema]) as Schemas),
      ),
    );
    const [dTs, ts] = await tools.getPrettyStoreApi(storeName);
    const dTsFile = resolve(outputDir, `${storeName}.d.ts`);
    const tsFile = resolve(outputDir, `${storeName}.ts`);
    writeFileSync(dTsFile, dTs, UTF8);
    writeFileSync(tsFile, ts, UTF8);
    log(`    Definition: ${dTsFile}`, `Implementation: ${tsFile}`);
  } catch {
    err('provide a valid schemaFile, storeName, and outputDir');
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
    'generate .d.ts and .ts files from a schema file',
  ],
};

const main = () => {
  const [, , command, ...args] = process.argv;
  (commands[command]?.[0] ?? help)(...args);
};

main();
