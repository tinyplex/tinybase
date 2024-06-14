// All other imports are lazy so that single tasks start up fast.
import {basename, dirname, join, resolve} from 'path';
import {existsSync, promises, readdirSync} from 'fs';
import gulp from 'gulp';
import {gzipSync} from 'zlib';

const UTF8 = 'utf-8';
const TEST_MODULES = [
  '',
  'ui-react',
  'ui-react-dom',
  'ui-react-inspector',
  'tools',
  'persisters/persister-automerge',
  'persisters/persister-browser',
  'persisters/persister-cr-sqlite-wasm',
  'persisters/persister-electric-sql',
  'persisters/persister-powersync',
  'persisters/persister-expo-sqlite',
  'persisters/persister-file',
  'persisters/persister-indexed-db',
  'persisters/persister-libsql',
  'persisters/persister-partykit-client',
  'persisters/persister-partykit-server',
  'persisters/persister-remote',
  'persisters/persister-sqlite-wasm',
  'persisters/persister-sqlite3',
  'persisters/persister-yjs',
  'synchronizers/synchronizer-local',
  'synchronizers/synchronizer-ws-client',
  'synchronizers/synchronizer-ws-server',
];
const ALL_MODULES = [
  ...TEST_MODULES,
  'store',
  'metrics',
  'indexes',
  'relationships',
  'queries',
  'checkpoints',
  'mergeable-store',
  'persisters',
  'synchronizers',
  'common',
];
const ALL_DEFINITIONS = [
  ...ALL_MODULES,
  '_internal/store',
  '_internal/queries',
  '_internal/ui-react',
];

const DIST_DIR = 'dist';
const DOCS_DIR = 'docs';
const TMP_DIR = 'tmp';
const LINT_BLOCKS = /```[jt]sx?( [^\n]+)?(\n.*?)```/gms;
const TYPES_DOC_CODE_BLOCKS = /\/\/\/\s*(\S*)(.*?)(?=(\s*\/\/)|(\n\n)|(\n$))/gs;
const TYPES_DOC_BLOCKS = /(\/\*\*.*?\*\/)\s*\/\/\/\s*(\S*)/gs;

const getGlobalName = (module) =>
  'TinyBase' +
  (module == ''
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

const allOf = async (array, cb) => await Promise.all(array.map(cb));
const testModules = async (cb) => await allOf(TEST_MODULES, cb);
const allModules = async (cb) => await allOf(ALL_MODULES, cb);
const allDefinitions = async (cb) => await allOf(ALL_DEFINITIONS, cb);

const clearDir = async (dir = DIST_DIR) => {
  try {
    await removeDir(dir);
  } catch {}
  await makeDir(dir);
};

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

const forEachDeepFile = (dir, callback, extension = '') =>
  forEachDirAndFile(
    dir,
    (dir) => forEachDeepFile(dir, callback, extension),
    (file) => callback(file),
    extension,
  );

const forEachDirAndFile = (dir, dirCallback, fileCallback, extension = '') =>
  readdirSync(dir, {withFileTypes: true}).forEach((entry) => {
    const path = resolve(join(dir, entry.name));
    entry.isDirectory()
      ? dirCallback?.(path)
      : path.endsWith(extension)
        ? fileCallback?.(path)
        : null;
  });

const copyWithReplace = async (src, [from, to], dst = src) => {
  const file = await promises.readFile(src, UTF8);
  await promises.writeFile(dst, file.replace(from, to), UTF8);
};

const gzipFile = async (fileName) =>
  await promises.writeFile(
    `${fileName}.gz`,
    gzipSync(await promises.readFile(fileName, UTF8), {level: 9}),
  );

const copyPackageFiles = async (forProd = false) => {
  const targets = forProd ? [null, 'es6'] : [null];
  const mins = forProd ? [null, 'min'] : [null];
  const modules = forProd ? ALL_MODULES : TEST_MODULES;
  const schemas = [null, 'with-schemas'];

  const json = JSON.parse(await promises.readFile('package.json', UTF8));
  delete json.private;
  delete json.scripts;
  delete json.devDependencies;

  json.bin = {tinybase: './cli/index.js'};
  json.main = './index.js';
  json.types = './@types/index.d.ts';

  json.typesVersions = {'*': {}};
  json.exports = {};
  targets.forEach((target) => {
    mins.forEach((min) => {
      modules.forEach((module) => {
        schemas.forEach((withSchemas) => {
          const path = [target, min, module, withSchemas]
            .filter((part) => part)
            .join('/');
          const typesPath = ['.', '@types', module, withSchemas, 'index.d.']
            .filter((part) => part)
            .join('/');
          const codePath = (path ? '/' : '') + path;

          json.typesVersions['*'][path ? path : '.'] = [typesPath + 'ts'];

          json.exports['.' + codePath] = {
            ...(forProd
              ? {
                  require: {
                    types: typesPath + 'cts',
                    default: './cjs' + codePath + '/index.cjs',
                  },
                }
              : {}),
            default: {
              types: typesPath + 'ts',
              default: '.' + codePath + '/index.js',
            },
          };
        });
      });
    });
  });

  await promises.writeFile(
    join(DIST_DIR, 'package.json'),
    JSON.stringify(json, undefined, 2),
    UTF8,
  );

  await promises.copyFile('LICENSE', join(DIST_DIR, 'LICENSE'));
  await promises.copyFile('readme.md', join(DIST_DIR, 'readme.md'));
  await promises.copyFile('releases.md', join(DIST_DIR, 'releases.md'));
};

let labelBlocks;
const getLabelBlocks = async () => {
  if (labelBlocks == null) {
    labelBlocks = new Map();
    await allModules(async (module) => {
      [
        ...(
          await promises.readFile(`src/@types/${module}/docs.js`, UTF8)
        ).matchAll(TYPES_DOC_BLOCKS),
      ].forEach(([_, block, label]) => {
        if (labelBlocks.has(label)) {
          throw new Error(`Duplicate label '${label}' in ${module}`);
        }
        labelBlocks.set(label, block);
      });
    });
  }
  return labelBlocks;
};

const copyDefinition = async (dir, module) => {
  const labelBlocks = await getLabelBlocks();
  // Add easier-to-read with-schemas blocks
  const codeBlocks = new Map();
  [
    ...(
      await promises.readFile(`src/@types/${module}/index.d.ts`, UTF8)
    ).matchAll(TYPES_DOC_CODE_BLOCKS),
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
    block.replace(TYPES_DOC_CODE_BLOCKS, (_, label, code) => {
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

  await allOf(['', '/with-schemas'], async (extraDir) => {
    const definitionFile = await ensureDir(
      `${dir}/@types/${module}${extraDir}/index.d.ts`,
    );
    await promises.writeFile(
      definitionFile,
      fileRewrite(
        await promises.readFile(
          `src/@types/${module}${extraDir}/index.d.ts`,
          UTF8,
        ),
        extraDir != '',
      ),
      UTF8,
    );
    await copyWithReplace(
      definitionFile,
      [/\.d\.ts/g, '.d.cts'],
      definitionFile.replace(/index.d.ts$/, 'index.d.cts'),
    );
  });
};

const copyDefinitions = async (dir) => {
  await allDefinitions((module) => copyDefinition(dir, module));
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

const lintCheckFiles = async (dir) => {
  const {
    default: {ESLint},
  } = await import('eslint');
  const esLint = new ESLint({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  });
  const results = await esLint.lintFiles([dir]);
  if (
    results.filter((result) => result.errorCount > 0 || result.warningCount > 0)
      .length > 0
  ) {
    const formatter = await esLint.loadFormatter();
    const errors = await formatter.format(results);
    throw errors;
  }
};

const lintCheckDocs = async (dir) => {
  const {
    default: {ESLint},
  } = await import('eslint');
  const esLint = new ESLint({
    extensions: [],
    overrideConfig: {
      rules: {
        'no-console': 0,
        'react/prop-types': 0,
        'react-hooks/rules-of-hooks': 0,
        'max-len': [
          2,
          {code: 80, ignorePattern: '^(\\s+\\* )?((im|ex)ports?|// ->)\\W.*'},
        ],
      },
    },
  });
  const {default: prettier} = await import('prettier');
  const prettierConfig = await getPrettierConfig();
  const docConfig = {...prettierConfig, printWidth: 75};

  const filePaths = [];
  ['.js', '.d.ts'].forEach((extension) =>
    forEachDeepFile(dir, (filePath) => filePaths.push(filePath), extension),
  );
  await allOf(filePaths, async (filePath) => {
    const code = await promises.readFile(filePath, UTF8);
    if (
      !(await prettier.check(code, {...prettierConfig, filepath: filePath}))
    ) {
      throw `${filePath} not pretty`;
    }
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
          throw `${filePath} not pretty:\n${code}\n\nShould be:\n${pretty}\n`;
        }
        const results = await esLint.lintText(code);
        if (
          results.filter(
            (result) => result.errorCount > 0 || result.warningCount > 0,
          ).length > 0
        ) {
          const formatter = await esLint.loadFormatter();
          const errors = await formatter.format(results);
          throw `${filePath} does not lint:\n${code}\n\n${errors}`;
        }
      },
    );
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

const compileModule = async (
  module,
  dir = DIST_DIR,
  format = 'esm',
  target = 'esnext',
  min = '',
  cli = false,
) => {
  const path = await import('path');
  const {default: esbuild} = await import('rollup-plugin-esbuild');
  const {rollup} = await import('rollup');
  const {default: replace} = await import('@rollup/plugin-replace');
  const {default: prettierPlugin} = await import('rollup-plugin-prettier');
  const {default: shebang} = await import('rollup-plugin-preserve-shebang');
  const {default: image} = await import('@rollup/plugin-image');
  const {default: terser} = await import('@rollup/plugin-terser');

  let inputFile = `src/${module}/index.ts`;
  if (!existsSync(inputFile)) {
    inputFile += 'x';
  }

  const inputConfig = {
    external: [
      'expo-sqlite/next.js',
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
      'tinybase/store',
      'tinybase/tools',
      '../ui-react',
    ],
    input: inputFile,
    plugins: [
      esbuild({
        target,
        legalComments: 'inline',
      }),
      replace({
        '/*!': '\n/*',
        delimiters: ['', ''],
        preventAssignment: true,
        ...(cli
          ? {
              '../store/index.ts': 'tinybase/store',
              '../tools/index.ts': 'tinybase/tools',
            }
          : {}),
        '../ui-react/index.ts': '../ui-react',
      }),
      shebang(),
      image(),
      min
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
          ]
        : prettierPlugin(await getPrettierConfig()),
    ],
    onwarn: (warning, warn) => {
      if (warning.code !== 'MISSING_NODE_BUILTINS') {
        warn(warning);
      }
    },
  };

  const moduleDir = dirname(await ensureDir(dir + '/' + module + '/-'));

  const index = 'index.' + (format == 'cjs' ? 'c' : '') + 'js';
  const outputConfig = {
    dir: moduleDir,
    entryFileNames: index,
    format,
    globals: {
      'expo-sqlite/next.js': 'expo-sqlite/next',
      'fs/promises': 'fs/promises',
      'react-dom': 'ReactDOM',
      fs: 'fs',
      react: 'React',
      yjs: 'yjs',
      [path.resolve('src/ui-react')]: getGlobalName('ui-react'),
    },
    interop: 'default',
    name: getGlobalName(module),
  };

  await (await rollup(inputConfig)).write(outputConfig);

  // kill me now
  const outputFile = join(moduleDir, index);
  const outputFiles = [outputFile];
  if (!cli) {
    const outputFileWithSchemas = await ensureDir(
      join(moduleDir, 'with-schemas', index),
    );
    outputFiles.push(outputFileWithSchemas);
    await copyWithReplace(
      outputFile,
      ['../ui-react', '../../ui-react/with-schemas/' + index],
      outputFileWithSchemas,
    );
  }
  await copyWithReplace(
    outputFile,
    ['../ui-react', '../ui-react/' + index],
    outputFile,
  );

  if (min) {
    allOf(outputFiles, async (outputFile) => await gzipFile(outputFile));
  }
};

// coverageMode = 0: none; 1: screen; 2: json; 3: html
const test = async (
  dir,
  {coverageMode, countAsserts, puppeteer, serialTests} = {},
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
              `${DIST_DIR}/index.js`,
              `${DIST_DIR}/ui-react/index.js`,
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

const compileDocsAndAssets = async (api = true, pages = true) => {
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

  // eslint-disable-next-line import/no-unresolved
  const {build} = await import('./tmp/build.js');
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

const {parallel, series} = gulp;

// --

export const preparePackage = copyPackageFiles;

export const compileForTest = async () => {
  await clearDir(DIST_DIR);
  await copyPackageFiles();
  await copyDefinitions(DIST_DIR);
  await testModules(async (module) => {
    await compileModule(module, DIST_DIR);
  });
};

export const lintFiles = async () => await lintCheckFiles('.');
export const lintDocs = async () => await lintCheckDocs('src');
export const lint = parallel(lintFiles, lintDocs);

export const spell = async () => {
  await spellCheck('.');
  await spellCheck('src', true);
  await spellCheck('test', true);
  await spellCheck('site', true);
};

export const ts = async () => {
  await tsCheck('src');
  await tsCheck('test');
  await tsCheck('site');
};

export const compileForProd = async () => {
  await clearDir(DIST_DIR);
  await copyPackageFiles(true);
  await copyDefinitions(DIST_DIR);

  await allOf(
    [undefined, 'cjs', 'umd'],
    async (format) =>
      await allOf(
        [undefined, 'es6'],
        async (target) =>
          await allModules(
            async (module) =>
              await allOf(
                [undefined, 'min'],
                async (min) =>
                  await compileModule(
                    module,
                    `${DIST_DIR}/` +
                      [format, target, min]
                        .filter((part) => part != null)
                        .join('/'),
                    format,
                    target,
                    min,
                  ),
              ),
          ),
      ),
  );

  await compileModule('cli', DIST_DIR, undefined, undefined, undefined, true);
  await execute(`chmod +x ${DIST_DIR}/cli/index.js`);
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

export const compileDocsPagesOnly = async () =>
  await compileDocsAndAssets(false);

export const compileDocsAssetsOnly = async () =>
  await compileDocsAndAssets(false, false);

export const compileDocs = async () => await compileDocsAndAssets();

export const compileForProdAndDocs = series(compileForProd, compileDocs);

export const testE2e = async () => {
  await test('test/e2e', {puppeteer: true});
};
export const compileAndTestE2e = series(compileForProdAndDocs, testE2e);

export const testProd = async () => {
  await execute('attw --pack dist --format table-flipped');
  await test('test/prod');
};
export const compileAndTestProd = series(compileForProdAndDocs, testProd);

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
  compileForTest,
  parallel(lint, spell, ts),
  testUnitCountAsserts,
  testPerf,
  compileForProd,
  testProd,
  compileDocs,
  testE2e,
);

export const publishPackage = series(prePublishPackage, npmPublish);
