#! /usr/bin/env node

import {jsonParse, mathMax} from './common/other';
import {readFileSync, writeFileSync} from 'fs';
import {UTF8} from './common/strings';
import {arrayForEach} from './common/array';
import {createStore} from '../lib/tinybase.js';
import {createTools} from '../lib/tools.js';
import {objMap} from './common/obj';
import {resolve} from 'path';

const log = (...lines: string[]) =>
  // eslint-disable-next-line no-console
  arrayForEach(lines, (line) => console.log(line));

const pad = (str: string, length = 10) => str.padEnd(length);

const getJson = (file: string) => jsonParse(readFileSync(file, UTF8));

const help = () => {
  log('tinybase <command>', '', 'Usage:', '');
  objMap(commands, ([, args, help], command) =>
    log(` tinybase ${pad(`${command} ${args}`, largestTab)} ${help}`),
  );
};

const version = () => log(getJson('./package.json').version);

const generateApi = async (
  schemaFile: string,
  storeName: string,
  outputDir: string,
) => {
  try {
    const tools = createTools(createStore().setSchema(getJson(schemaFile)));
    const [dTs, ts] = await tools.getPrettyStoreApi(storeName);
    const dTsFile = resolve(outputDir, `${storeName}.d.ts`);
    const tsFile = resolve(outputDir, `${storeName}.ts`);
    writeFileSync(dTsFile, dTs, UTF8);
    writeFileSync(tsFile, ts, UTF8);
    log('API written to:', `  ${dTsFile}`, `  ${tsFile}`);
  } catch {
    log('Provide a valid schemaFile, storeName, and outputDir.');
  }
};

const commands: {
  [command: string]: [
    call: (...args: string[]) => void,
    args: string,
    help: string,
  ];
} = {
  help: [help, '', 'Print this message.'],
  version: [version, '', 'Get the current TinyBase version.'],
  generateApi: [
    generateApi,
    '<schemaFile> <storeName> <outputDir>',
    'Generate .d.ts and .ts files from a schema file.',
  ],
};
const largestTab = mathMax(
  ...objMap(commands, ([, args], command) => (args + command).length + 3),
);

const main = () => {
  const [, , command, ...args] = process.argv;
  (commands[command]?.[0] ?? help)(...args);
};

main();
