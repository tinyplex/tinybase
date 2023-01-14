#! /usr/bin/env node

import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import {UTF8} from './common/strings';
import {arrayForEach} from './common/array';
import {createStore} from './tinybase';
import {createTools} from './tools';
import {fileURLToPath} from 'url';
import {jsonParse} from './common/other';
import {objMap} from './common/obj';

const log = (...lines: string[]) =>
  arrayForEach(lines, (line) => process.stdout.write(`${line}\n`));

const err = (line: string) => process.stderr.write(`ERROR: ${line}\n`);

const getJson = (file: string) => jsonParse(readFileSync(file, UTF8));

const help = () => {
  log('', 'tinybase <command>', '', 'Usage:', '');
  objMap(commands, ([, args, help], command) =>
    log(` tinybase ${command} ${args}`, ` - ${help}`, ''),
  );
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
    const tools = createTools(
      createStore().setTablesSchema(getJson(schemaFile)),
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
