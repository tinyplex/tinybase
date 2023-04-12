/*
  eslint-disable
    jest/no-identical-title,
    jest/no-disabled-tests,
    jest/expect-expect,
    jest/no-export,
    @typescript-eslint/explicit-module-boundary-types
*/

// All other imports are lazy so that single tasks start up fast.
import gulp from 'gulp';
import {promises} from 'fs';

const {parallel, series} = gulp;

const UTF8 = 'utf-8';
const TEST_MODULES = ['tinybase', 'ui-react', 'tools'];
const ALL_MODULES = TEST_MODULES.concat([
  'store',
  'indexes',
  'metrics',
  'relationships',
  'queries',
  'checkpoints',
  'persisters',
  'common',
]);
const BIN_DIR = 'bin';
const LIB_DIR = 'lib';
const TYPES_DIR = 'lib/types';
const TYPES_SCHEMA_DIR = `${TYPES_DIR}/with-schemas/`;
const DOCS_DIR = 'docs';
const TMP_DIR = 'tmp';
const LINT_BLOCKS = /```[jt]sx?( [^\n]+)?(\n.*?)```/gms;
const TYPES_DOC_LABELS = /\/\/\/\s*(\S*)/g;
const TYPES_DOC_BLOCKS = /(\/\*\*.*?\*\/)\s*\/\/\/\s*(\S*)/gs;

const getPrettierConfig = async () => ({
  ...JSON.parse(await promises.readFile('.prettierrc', UTF8)),
  parser: 'typescript',
});

const allOf = async (array, cb) => await Promise.all(array.map(cb));
const testModules = async (cb) => await allOf(TEST_MODULES, cb);
const allModules = async (cb) => await allOf(ALL_MODULES, cb);

const makeDir = async (dir) => {
  try {
    await promises.mkdir(dir);
  } catch (e) {}
};

const removeDir = async (dir) => {
  await promises.rm(dir, {recursive: true});
};

const clearDir = async (dir = LIB_DIR) => {
  try {
    await removeDir(dir);
  } catch {}
  await makeDir(dir);
};

const copyDefinition = async (module) => {
  const labelBlocks = new Map();
  [
    ...(await promises.readFile(`src/types/docs/${module}.js`, UTF8)).matchAll(
      TYPES_DOC_BLOCKS,
    ),
  ].forEach(([_, block, label]) => labelBlocks.set(label, block));

  await allOf(['', 'with-schemas/'], async (extraDir) => {
    await promises.writeFile(
      `${TYPES_DIR}/${extraDir}${module}.d.ts`,
      (
        await promises.readFile(`src/types/${extraDir}${module}.d.ts`, UTF8)
      ).replace(TYPES_DOC_LABELS, (_, label) => {
        if (labelBlocks.has(label)) {
          return labelBlocks.get(label);
        }
        throw `Missing docs label ${label} in ${module}`;
      }),
      UTF8,
    );
  });
};

const copyDefinitions = async () => {
  await makeDir(TYPES_DIR);
  await makeDir(TYPES_SCHEMA_DIR);
  await copyDefinition('common');
  await allModules((module) => copyDefinition(module));
  await promises.copyFile(
    `src/types/with-schemas/internal.d.ts`,
    `${TYPES_SCHEMA_DIR}internal.d.ts`,
  );
};

const execute = async (cmd) => {
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

const lintCheck = async (dir) => {
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
    if (!prettier.check(code, prettierConfig)) {
      throw `${filePath} not pretty`;
    }
    if (filePath.endsWith('.d.ts')) {
      [...(code.matchAll(LINT_BLOCKS) ?? [])].forEach(([_, hint, docBlock]) => {
        if (hint?.trim() == 'override') {
          return; // can't lint orphaned TS methods
        }
        const code = docBlock.replace(/\n +\* ?/g, '\n').trimStart();
        if (!prettier.check(code, docConfig)) {
          const pretty = prettier
            .format(code, docConfig)
            .trim()
            .replace(/^|\n/g, '\n * ');
          throw `${filePath} not pretty:\n${code}\n\nShould be:\n${pretty}\n`;
        }
      });
    }
  });
};

const spellCheck = async (dir, deep = false) =>
  await execute(`cspell "${dir}/*${deep ? '*' : ''}"`);

const getTsOptions = async (dir) => {
  const {default: tsc} = await import('typescript');
  return tsc.parseJsonSourceFileConfigFileContent(
    tsc.readJsonConfigFile(`${dir}/tsconfig.json`, tsc.sys.readFile),
    tsc.sys,
    dir,
  );
};

const tsCheck = async (dir) => {
  const path = await import('path');
  const {default: tsc} = await import('typescript');
  const {
    default: {default: unusedExports},
  } = await import('ts-unused-exports');
  const {fileNames, options} = await getTsOptions(dir);
  const results = tsc.getPreEmitDiagnostics(
    tsc.createProgram(fileNames, options),
  );
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
      '--excludePathsFromReport=tinybase.ts;ui-react.ts;tools.ts;build.ts',
    ]),
  )
    .map(
      ([file, exps]) =>
        `${file}: ${exps.map((exp) => exp.exportName).join(', ')}`,
    )
    .join('\n');
  if (unusedResults != '') {
    throw `Unused exports in: \n${unusedResults}`;
  }
};

const compileModule = async (
  module,
  debug,
  dir = LIB_DIR,
  format = 'esm',
  target = 'esnext',
  cli,
) => {
  const {default: esbuild} = await import('rollup-plugin-esbuild');
  const {rollup} = await import('rollup');
  const {default: terser} = await import('@rollup/plugin-terser');
  const {default: replace} = await import('@rollup/plugin-replace');
  const {default: gzipPlugin} = await import('rollup-plugin-gzip');
  const {default: prettierPlugin} = await import('rollup-plugin-prettier');
  const {default: shebang} = await import('rollup-plugin-preserve-shebang');

  const inputConfig = {
    external: [
      'fs',
      'path',
      'prettier',
      'react',
      'url',
      './tinybase',
      './tools',
    ],
    input: `src/${module}.ts`,
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
    ].concat(
      debug
        ? [prettierPlugin(await getPrettierConfig())]
        : [
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
          ].concat(cli ? [] : [gzipPlugin()]),
    ),
    onwarn: (warning, warn) => {
      if (warning.code !== 'MISSING_NODE_BUILTINS') {
        warn(warning);
      }
    },
  };

  const outputConfig = {
    dir,
    entryFileNames: `[name].${format == 'cjs' ? 'cjs' : 'js'}`,
    format,
    globals: {
      react: 'React',
      fs: 'fs',
    },
    interop: 'default',
    name:
      'TinyBase' +
      (module == 'tinybase'
        ? ''
        : module == 'ui-react'
        ? 'UiReact'
        : module[0].toUpperCase() + module.slice(1)),
  };

  await (await rollup(inputConfig)).write(outputConfig);
};

// coverageMode = 0: none; 1: screen; 2: json; 3: html
const test = async (
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
          }
        : {testEnvironment: './test/jest/environment'}),
      ...(coverageMode > 0
        ? {
            collectCoverage: true,
            coverageProvider: 'babel',
            collectCoverageFrom: [
              `${LIB_DIR}/debug/tinybase.js`,
              `${LIB_DIR}/debug/ui-react.js`,
              // `${LIB_DIR}/debug/tools.js`,
              // ^ some common functions cannot be fully exercised
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

const compileDocsAndAssets = async (api = true, pages = true) => {
  const {default: esbuild} = await import('esbuild');

  const buildModule = './tmp/build.js';
  await makeDir(TMP_DIR);
  await esbuild.build({
    entryPoints: ['site/build.ts'],
    external: ['tinydocs', 'react', 'prettier'],
    bundle: true,
    outfile: buildModule,
    format: 'esm',
    platform: 'node',
  });
  const {build} = await import(buildModule);
  await build(DOCS_DIR, api, pages);
  await removeDir(TMP_DIR);
};

const npmInstall = async () => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  return await promisify(exec)('npm install --legacy-peer-deps');
};

const npmPublish = async () => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  return await promisify(exec)('npm publish');
};

//--

export const lint = async () => await lintCheck('.');

export const spell = async () => {
  await spellCheck('.');
  await spellCheck('src', true);
  await spellCheck('test', true);
  await spellCheck('site', true);
};

export const ts = async () => {
  await copyDefinitions();
  await tsCheck('src');
  await tsCheck('test');
  await tsCheck('site');
};

export const compileForTest = async () => {
  await clearDir(LIB_DIR);
  await testModules(async (module) => {
    await compileModule(module, true, `${LIB_DIR}/debug`);
  });
  await copyDefinitions();
  await compileForCli();
};

export const compileForProd = async () => {
  await clearDir(LIB_DIR);

  await allModules(async (module) => {
    await allOf(
      [undefined, 'umd', 'cjs'],
      async (format) =>
        await allOf(
          [undefined, 'es6'],
          async (target) =>
            await allOf(
              [false, ...(target || format ? [] : [true])],
              async (debug) => {
                const folder = `${LIB_DIR}/${[
                  debug ? 'debug' : '',
                  format,
                  target,
                ]
                  .filter((token) => token)
                  .join('-')}`;
                await compileModule(module, debug, folder, format, target);
              },
            ),
        ),
    );
  });

  await copyDefinitions();
  await compileForCli();
};

export const compileForCli = async () => {
  await clearDir(BIN_DIR);
  await compileModule('cli', false, BIN_DIR, undefined, undefined, true);
  await execute(`chmod +x ${BIN_DIR}/cli.js`);
};

export const testUnit = async () => {
  await test('test/unit', {coverageMode: 1});
};
export const testUnitCountAsserts = async () => {
  await test('test/unit', {coverageMode: 2, countAsserts: true});
};
export const testUnitSaveCoverage = async () => {
  await test('test/unit', {coverageMode: 3});
};
export const compileAndTestUnit = series(compileForTest, testUnit);
export const compileAndTestUnitSaveCoverage = series(
  compileForTest,
  testUnitSaveCoverage,
);

export const testPerf = async () => {
  await test('test/perf', {serialTests: true});
};
export const compileAndTestPerf = series(compileForTest, testPerf);

export const testE2e = async () => {
  await test('test/e2e', {puppeteer: true});
};
export const compileAndTestE2e = series(compileForTest, testE2e);

export const compileDocsPagesOnly = async () =>
  await compileDocsAndAssets(false);

export const compileDocsAssetsOnly = async () =>
  await compileDocsAndAssets(false, false);

export const compileDocs = async () => await compileDocsAndAssets();

export const compileForProdAndDocs = series(compileForProd, compileDocs);

export const serveDocs = async () => {
  const {createServer} = await import('http-server');
  const {default: replace} = await import('buffer-replace');
  const removeDomain = (_, res) => {
    res._write = res.write;
    res.write = (buffer) =>
      res._write(replace(buffer, 'https://tinybase.org/', '/'.padStart(21)));
    res.emit('next');
  };
  createServer({
    root: DOCS_DIR,
    cache: -1,
    gzip: true,
    // eslint-disable-next-line no-console
    logFn: (req) => console.log(req.url),
    before: [removeDomain],
  }).listen('8080', '0.0.0.0');
};

export const preCommit = series(
  parallel(lint, spell, ts),
  compileForTest,
  testUnit,
  compileForProd,
);

export const prePublishPackage = series(
  npmInstall,
  parallel(lint, spell, ts),
  compileForTest,
  testUnitCountAsserts,
  testPerf,
  compileForProd,
  compileDocs,
  testE2e,
);

export const publishPackage = series(prePublishPackage, npmPublish);
