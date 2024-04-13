/*
  eslint-disable
    jest/no-identical-title,
    jest/no-disabled-tests,
    jest/expect-expect,
    jest/no-export,
    @typescript-eslint/explicit-module-boundary-types
*/

// All other imports are lazy so that single tasks start up fast.
import {basename, dirname} from 'path';
import {existsSync, promises} from 'fs';

const UTF8 = 'utf-8';
const TEST_MODULES = [
  'tinybase',
  'ui-react',
  'ui-react-dom',
  'tools',
  'persisters/persister-automerge',
  'persisters/persister-browser',
  'persisters/persister-cr-sqlite-wasm',
  'persisters/persister-electric-sql',
  'persisters/persister-powersync',
  'persisters/persister-expo-sqlite',
  'persisters/persister-expo-sqlite-next',
  'persisters/persister-file',
  'persisters/persister-indexed-db',
  'persisters/persister-libsql',
  'persisters/persister-partykit-client',
  'persisters/persister-partykit-server',
  'persisters/persister-remote',
  'persisters/persister-sqlite-wasm',
  'persisters/persister-sqlite3',
  'persisters/persister-sync',
  'persisters/persister-yjs',
];
const MODULES_TYPED_WITH_INTERNALS = ['store', 'queries', 'ui-react'];
const ALL_MODULES = [
  'tinybase',
  'store',
  'metrics',
  'indexes',
  'relationships',
  'queries',
  'checkpoints',
  'mergeable-store',
  'persisters',
  'common',
  'ui-react',
  'ui-react-dom',
  'tools',
  'persisters/persister-automerge',
  'persisters/persister-browser',
  'persisters/persister-cr-sqlite-wasm',
  'persisters/persister-electric-sql',
  'persisters/persister-powersync',
  'persisters/persister-expo-sqlite',
  'persisters/persister-expo-sqlite-next',
  'persisters/persister-file',
  'persisters/persister-indexed-db',
  'persisters/persister-libsql',
  'persisters/persister-partykit-client',
  'persisters/persister-partykit-server',
  'persisters/persister-remote',
  'persisters/persister-sqlite-wasm',
  'persisters/persister-sqlite3',
  'persisters/persister-sync',
  'persisters/persister-yjs',
];

export const BIN_DIR = 'bin';
export const LIB_DIR = 'lib';
export const DOCS_DIR = 'docs';
const TYPES_DIR = 'lib/types';
const TYPES_SCHEMA_DIR = `${TYPES_DIR}/with-schemas/`;
const TMP_DIR = 'tmp';
const LINT_BLOCKS = /```[jt]sx?( [^\n]+)?(\n.*?)```/gms;
const TYPES_DOC_CODE_BLOCKS = /\/\/\/\s*(\S*)(.*?)(?=(\s*\/\/)|(\n\n)|(\n$))/gs;
const TYPES_DOC_BLOCKS = /(\/\*\*.*?\*\/)\s*\/\/\/\s*(\S*)/gs;

const getGlobalName = (module) =>
  'TinyBase' +
  (module == 'tinybase'
    ? ''
    : basename(module)
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
        .join('')
        .replace('Partykit', 'PartyKit')); // lol

const getPrettierConfig = async () => ({
  ...JSON.parse(await promises.readFile('.prettierrc', UTF8)),
  parser: 'typescript',
});

export const allOf = async (array, cb) => await Promise.all(array.map(cb));
export const testModules = async (cb) => await allOf(TEST_MODULES, cb);
export const allModules = async (cb) => await allOf(ALL_MODULES, cb);

const makeDir = async (dir) => {
  try {
    await promises.mkdir(dir);
  } catch (e) {}
};

const ensureDir = async (fileOrDirectory) => {
  await promises.mkdir(dirname(fileOrDirectory), {recursive: true});
  return fileOrDirectory;
};

const removeDir = async (dir) => {
  await promises.rm(dir, {recursive: true});
};

export const clearDir = async (dir = LIB_DIR) => {
  try {
    await removeDir(dir);
  } catch {}
  await makeDir(dir);
};

const labelBlocks = new Map();
const getLabelBlocks = async () => {
  if (labelBlocks.size == 0) {
    await allModules(async (module) =>
      [
        ...(
          await promises.readFile(`src/types/docs/${module}.js`, UTF8)
        ).matchAll(TYPES_DOC_BLOCKS),
      ].forEach(([_, block, label]) => {
        if (labelBlocks.has(label)) {
          throw new Error('Duplicate label, ' + label);
        }
        labelBlocks.set(label, block);
      }),
    );
  }
  return labelBlocks;
};

const copyDefinition = async (module) => {
  const labelBlocks = await getLabelBlocks();
  // Add easier-to-read with-schemas blocks
  const codeBlocks = new Map();
  [
    ...(await promises.readFile(`src/types/${module}.d.ts`, UTF8)).matchAll(
      TYPES_DOC_CODE_BLOCKS,
    ),
  ].forEach(([_, label, code]) => {
    const prefix = code.match(/^\n\s*/m)?.[0];
    if (prefix) {
      codeBlocks.set(
        label,
        code
          .replace(/export type \S+ =\s/, '')
          .replace(/export function /, '')
          .replaceAll(prefix, prefix + ' * '),
      );
    }
  });
  const fileRewrite = (block, addOverrideSnippet) =>
    block
      .replace(/\.d';/g, `.d.ts';`)
      .replace(TYPES_DOC_CODE_BLOCKS, (_, label, code) => {
        if (labelBlocks.has(label)) {
          const codeOverride = codeBlocks.get(label);
          let block = labelBlocks.get(label);
          if (
            addOverrideSnippet &&
            codeBlocks.has(label) &&
            code.includes('<') &&
            code.includes('Schema') &&
            !codeOverride.endsWith('{')
          ) {
            const prefix = block.match(/^\s+\*$/m)?.[0];
            if (prefix) {
              const line = '\n' + prefix;
              block = block.replace(
                /^\s+\*$/m,
                `${prefix}${line}` +
                  ' This has schema-based typing.' +
                  ' The following is a simplified representation:' +
                  `${line}${line} \`\`\`ts override` +
                  codeOverride.trimEnd() +
                  `${line} \`\`\`${line}`,
              );
            }
            code = code.replace(/^\s*?\/\/\/.*?\n/gm, '');
          }
          return block + code;
        }
        throw `Missing docs label ${label} in ${module}`;
      });

  await allOf(
    ['', 'with-schemas/'].concat(
      ...(MODULES_TYPED_WITH_INTERNALS.includes(module)
        ? ['with-schemas/internal/']
        : []),
    ),
    async (extraDir) => {
      await promises.writeFile(
        await ensureDir(`${TYPES_DIR}/${extraDir}${module}.d.ts`),
        fileRewrite(
          await promises.readFile(`src/types/${extraDir}${module}.d.ts`, UTF8),
          extraDir != '',
        ),
        UTF8,
      );
    },
  );
};

export const copyDefinitions = async () => {
  await makeDir(TYPES_DIR);
  await makeDir(TYPES_SCHEMA_DIR);
  await makeDir(`${TYPES_SCHEMA_DIR}/internal`);
  await copyDefinition('common');
  await allModules((module) => copyDefinition(module));
};

export const execute = async (cmd) => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  try {
    await promisify(exec)(cmd);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw e.stdout;
  }
};

export const lintCheck = async (dir) => {
  const {
    default: {ESLint},
  } = await import('eslint');
  const {default: prettier} = await import('prettier');
  const esLint = new ESLint({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  });
  const results = await esLint.lintFiles([dir]);
  if (
    results.filter((result) => result.errorCount > 0 || result.warningCount > 0)
      .length > 0
  ) {
    const formatter = await esLint.loadFormatter();
    throw formatter.format(results);
  }
  const prettierConfig = await getPrettierConfig();
  const docConfig = {...prettierConfig, printWidth: 75};
  await allOf(results, async ({filePath}) => {
    const code = await promises.readFile(filePath, UTF8);
    if (
      !(await prettier.check(code, {...prettierConfig, filepath: filePath}))
    ) {
      throw `${filePath} not pretty`;
    }
    if (filePath.endsWith('.d.ts') || filePath.endsWith('.js')) {
      await allOf(
        [...(code.matchAll(LINT_BLOCKS) ?? [])],
        async ([_, hint, docBlock]) => {
          if (hint?.trim() == 'override') {
            return; // can't lint orphaned TS methods
          }
          const code = docBlock.replace(/\n +\* ?/g, '\n').trimStart();
          if (!(await prettier.check(code, docConfig))) {
            const pretty = (await prettier.format(code, docConfig))
              .trim()
              .replace(/^|\n/g, '\n * ');
            throw (
              `${filePath} not pretty:\n${code}` + `\n\nShould be:\n${pretty}\n`
            );
          }
        },
      );
    }
  });
};

export const spellCheck = async (dir, deep = false) =>
  await execute(`cspell "${dir}/*${deep ? '*' : ''}"`);

const getTsOptions = async (dir) => {
  const {default: tsc} = await import('typescript');
  return tsc.parseJsonSourceFileConfigFileContent(
    tsc.readJsonConfigFile(`${dir}/tsconfig.json`, tsc.sys.readFile),
    tsc.sys,
    dir,
  );
};

export const tsCheck = async (dir) => {
  const path = await import('path');
  const {default: tsc} = await import('typescript');
  const {
    default: {default: unusedExports},
  } = await import('ts-unused-exports');
  const {fileNames, options} = await getTsOptions(dir);
  const results = tsc
    .getPreEmitDiagnostics(
      tsc.createProgram(
        fileNames.filter((fileName) => !fileName.startsWith('test/unit/types')),
        options,
      ),
    )
    .filter((result) => !result.file.fileName.includes('/node_modules/'));
  if (results.length > 0) {
    const resultText = results
      .map((result) => {
        const {file, messageText, start} = result;
        const {line, character} = file.getLineAndCharacterOfPosition(start);
        return `${file.fileName}:${line}:${character}\n${JSON.stringify(
          messageText,
        )}`;
      })
      .join('\n\n');
    throw resultText;
  }
  const unusedResults = Object.entries(
    unusedExports(`${path.resolve(dir)}/tsconfig.json`, [
      '--excludeDeclarationFiles',
      '--excludePathsFromReport=' +
        'build.ts;ui-react/common.ts;' +
        TEST_MODULES.map((module) => `${module}.ts`).join(';'),
    ]),
  )
    .map(
      ([file, exps]) =>
        `${file}: ${exps.map((exp) => exp.exportName).join(', ')}`,
    )
    .join('\n');
  if (unusedResults != '') {
    throw `Unused exports for ${dir} in: \n${unusedResults}`;
  }
};

export const compileModule = async (
  module,
  debug,
  dir = LIB_DIR,
  format = 'esm',
  target = 'esnext',
  cli = false,
  terse = !debug,
  fileSuffix = '',
) => {
  const path = await import('path');
  const {default: esbuild} = await import('rollup-plugin-esbuild');
  const {rollup} = await import('rollup');
  const {default: terser} = await import('@rollup/plugin-terser');
  const {default: replace} = await import('@rollup/plugin-replace');
  const {default: gzipPlugin} = await import('rollup-plugin-gzip');
  const {default: prettierPlugin} = await import('rollup-plugin-prettier');
  const {default: shebang} = await import('rollup-plugin-preserve-shebang');
  const {default: image} = await import('@rollup/plugin-image');

  let inputFile = `src/${module}.ts`;
  if (!existsSync(inputFile)) {
    inputFile += 'x';
  }

  const inputConfig = {
    external: [
      'expo-sqlite/next',
      'fs',
      'fs/promises',
      'path',
      'prettier/standalone',
      'prettier/plugins/estree',
      'prettier/plugins/typescript',
      'react',
      'react-dom',
      'url',
      'yjs',
      './tinybase',
      './ui-react',
      '../ui-react',
      './tools',
    ],
    input: inputFile,
    plugins: [
      esbuild({
        target,
        define: {'globalThis.DEBUG': '' + debug},
        legalComments: 'inline',
      }),
      replace({
        '/*!': '/*',
        delimiters: ['', ''],
        preventAssignment: true,
        ...(cli
          ? {
              [`from './tinybase'`]: `from 'tinybase'`,
              [`from './tools'`]: `from 'tinybase/tools'`,
            }
          : {}),
      }),
      shebang(),
      image(),
    ].concat(
      terse
        ? [
            terser({
              toplevel: true,
              compress: {
                unsafe: true,
                passes: 3,
                ...(module == 'tools'
                  ? {reduce_vars: false, reduce_funcs: false}
                  : {}),
              },
            }),
          ].concat(cli ? [] : [gzipPlugin()])
        : [prettierPlugin(await getPrettierConfig())],
    ),
    onwarn: (warning, warn) => {
      if (warning.code !== 'MISSING_NODE_BUILTINS') {
        warn(warning);
      }
    },
  };

  const outputConfig = {
    dir: dirname(await ensureDir(dir + '/' + module)),
    entryFileNames: `[name]${fileSuffix}.${format == 'cjs' ? 'cjs' : 'js'}`,
    format,
    globals: {
      'expo-sqlite/next': 'expo-sqlite/next',
      'fs/promises': 'fs/promises',
      'react-dom': 'ReactDOM',
      fs: 'fs',
      react: 'React',
      yjs: 'yjs',
      [path.resolve('src/ui-react')]: getGlobalName('ui-react'),
    },
    interop: 'default',
    name: getGlobalName(module) + (debug ? 'Debug' : ''),
  };

  await (await rollup(inputConfig)).write(outputConfig);
};

// coverageMode = 0: none; 1: screen; 2: json; 3: html
export const test = async (
  dir,
  {coverageMode, countAsserts, puppeteer, serialTests},
) => {
  const {default: jest} = await import('jest');
  await makeDir(TMP_DIR);
  const {
    results: {success},
  } = await jest.runCLI(
    {
      roots: [dir],
      ...(puppeteer
        ? {
            setupFilesAfterEnv: ['expect-puppeteer'],
            preset: 'jest-puppeteer',
            detectOpenHandles: true,
            maxWorkers: 2,
          }
        : {testEnvironment: './test/jest/environment'}),
      ...(coverageMode > 0
        ? {
            collectCoverage: true,
            coverageProvider: 'babel',
            collectCoverageFrom: [
              `${LIB_DIR}/debug/tinybase.js`,
              `${LIB_DIR}/debug/ui-react.js`,
              // Other modules cannot be fully exercised in isolation.
            ],
            coverageReporters: ['text-summary']
              .concat(coverageMode > 1 ? ['json-summary'] : [])
              .concat(coverageMode > 2 ? ['lcov'] : []),
            coverageDirectory: 'tmp',
          }
        : {}),
      ...(countAsserts
        ? {
            testEnvironment: './test/jest/environment',
            setupFilesAfterEnv: ['./test/jest/setup'],
            reporters: ['default', './test/jest/reporter'],
            runInBand: true,
          }
        : {}),
      ...(serialTests ? {runInBand: true} : {}),
    },
    [''],
  );
  if (!success) {
    await removeDir(TMP_DIR);
    throw 'Test failed';
  }
  if (coverageMode == 2) {
    await promises.writeFile(
      'coverage.json',
      JSON.stringify({
        ...(countAsserts
          ? JSON.parse(await promises.readFile('./tmp/assertion-summary.json'))
          : {}),
        ...JSON.parse(await promises.readFile('./tmp/coverage-summary.json'))
          .total,
      }),
      UTF8,
    );
  }
  if (coverageMode < 3) {
    await removeDir(TMP_DIR);
  }
};

export const compileDocsAndAssets = async (api = true, pages = true) => {
  const {default: esbuild} = await import('esbuild');
  const {default: esbuildPlugin} = await import('rollup-plugin-esbuild');
  const {default: terser} = await import('@rollup/plugin-terser');
  const {rollup} = await import('rollup');

  await makeDir(TMP_DIR);
  await esbuild.build({
    entryPoints: ['site/build.ts'],
    external: ['tinydocs', 'react', '@prettier/sync'],
    target: 'esnext',
    bundle: true,
    outfile: './tmp/build.js',
    format: 'esm',
    platform: 'node',
  });

  await (
    await rollup({
      input: 'node_modules/partysocket/dist/index.mjs',
      plugins: [esbuildPlugin(), terser({toplevel: true, compress: true})],
    })
  ).write({
    dir: 'tmp',
    entryFileNames: 'partysocket.js',
    format: 'umd',
    interop: 'default',
    name: 'PartySocketModule',
    exports: 'named',
  });

  const {build} = await import('../tmp/build.js');
  await build(DOCS_DIR, api, pages);
  await removeDir(TMP_DIR);
};

export const npmInstall = async () => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  return await promisify(exec)('npm install --legacy-peer-deps');
};

export const npmPublish = async () => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  return await promisify(exec)('npm publish');
};
