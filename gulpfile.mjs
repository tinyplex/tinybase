// All other imports are lazy so that single tasks start up fast.
import gulp from 'gulp';
import {promises} from 'fs';

const ALL_MODULES = [
  'tinybase',
  'store',
  'checkpoints',
  'indexes',
  'metrics',
  'relationships',
  'persisters',
  'common',
];
const LIB_DIR = 'lib';

const getPrettierConfig = async () => ({
  ...JSON.parse(await promises.readFile('.prettierrc', 'utf-8')),
  parser: 'typescript',
});

const allOf = async (array, cb) => await Promise.all(array.map(cb));
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
  await removeDir(dir);
  await makeDir(dir);
};

const copyDefinition = async (module, dir = LIB_DIR) => {
  await makeDir(dir);
  return await promises.copyFile(`src/${module}.d.ts`, `${dir}/${module}.d.ts`);
};

const copyDefinitions = async (dir = LIB_DIR) => {
  await copyDefinition('common', dir);
  await allModules((module) => copyDefinition(module, dir));
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
  if (results.filter((result) => result.errorCount > 0).length > 0) {
    const formatter = await esLint.loadFormatter();
    throw formatter.format(results);
  }
  const prettierConfig = await getPrettierConfig();
  const docConfig = {...prettierConfig, printWidth: 75};
  await allOf(results, async ({filePath}) => {
    if (filePath.includes('/test/coverage/')) {
      return;
    }
    const code = await promises.readFile(filePath, 'utf-8');
    if (!prettier.check(code, prettierConfig)) {
      throw `${filePath} not pretty`;
    }
    if (filePath.endsWith('.d.ts')) {
      code
        .match(/(?<=```[jt]sx?( [^\n]+)?)\n.*?(?=```)/gms)
        ?.forEach((docBlock) => {
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

const spellCheck = async (dir, deep = false) => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  const cmd = `cspell "${dir}/*${deep ? '*' : ''}"`;
  try {
    await promisify(exec)(cmd);
  } catch (e) {
    throw e.stdout;
  }
};

const getTsOptions = async (dir) => {
  const {default: tsc} = await import('typescript');
  return tsc.parseJsonSourceFileConfigFileContent(
    tsc.readJsonConfigFile(`${dir}/tsconfig.json`, tsc.sys.readFile),
    tsc.sys,
    dir,
  );
};

const tsCheck = async (dir) => {
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
    unusedExports(`${dir}/tsconfig.json`, [
      '--allowUnusedTypes',
      '--excludePathsFromReport=tinybase.ts',
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

const compileModule = async (module, debug, dir = LIB_DIR, format = 'es') => {
  const {default: esbuild} = await import('rollup-plugin-esbuild');
  const {rollup} = await import('rollup');
  const {terser} = await import('rollup-plugin-terser');
  const {default: replace} = await import('@rollup/plugin-replace');
  const {default: gzipPlugin} = await import('rollup-plugin-gzip');
  const {default: prettierPlugin} = await import('rollup-plugin-prettier');

  const inputConfig = {
    external: ['react', 'fs'],
    input: `src/${module}.ts`,
    plugins: [
      esbuild({
        target: 'esnext',
        define: {'globalThis.DEBUG': '' + debug},
        legalComments: 'inline',
      }),
      replace({
        '/*!': '/*',
        delimiters: ['', ''],
        preventAssignment: true,
      }),
    ].concat(
      debug
        ? [prettierPlugin(await getPrettierConfig())]
        : [
            terser({toplevel: true, compress: {unsafe: true, passes: 1}}),
            gzipPlugin(),
          ],
    ),
  };

  const outputConfig = {
    output: {
      dir,
      entryFileNames: `[name].js`,
      format,
      globals: {react: 'React', fs: 'fs'},
      interop: 'default',
      name:
        'TinyBase' +
        (module == 'tinybase' ? '' : module[0].toUpperCase() + module.slice(1)),
    },
  };

  await (await rollup(inputConfig)).write(outputConfig);
};

const npmInstall = async () => {
  const {exec} = await import('child_process');
  const {promisify} = await import('util');
  return await promisify(exec)('npm install');
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
};

export const ts = async () => {
  await copyDefinitions();
  await tsCheck('src');
  await copyDefinitions(`${LIB_DIR}/debug`);
};

export const compileForProd = async () => {
  await clearDir(LIB_DIR);
  await allModules(async (module) => {
    await compileModule(module, false);
    await compileModule(module, false, `${LIB_DIR}/umd`, 'umd');
    await compileModule(module, true, `${LIB_DIR}/debug`);
  });
  await copyDefinitions();
  await copyDefinitions(`${LIB_DIR}/debug`);
};

export const preCommit = gulp.series(lint, spell, ts, compileForProd);

export const prePublishPackage = gulp.series(
  npmInstall,
  lint,
  spell,
  ts,
  compileForProd,
);

export const publishPackage = gulp.series(prePublishPackage, npmPublish);
