import {FunctionComponent, ReactNode, createContext, useContext} from 'react';
import {readFileSync, statSync} from 'fs';
import {MODULES} from './common.ts';

type CoverageStats = {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
};
type Coverage = {
  tests: number;
  assertions: number;
  lines: CoverageStats;
  statements: CoverageStats;
  functions: CoverageStats;
  branches: CoverageStats;
};
type Metadata = {
  package: string;
  version: string;
  repository: string;
  license: string;
};
export type ModulesSizes = Map<string, Map<string, number>>;

type Build = {
  coverage: Coverage;
  metadata: Metadata;
  modulesSizes: ModulesSizes;
};

const build = ((): Build => {
  const coverage = JSON.parse(
    readFileSync('./coverage.json', 'utf-8'),
  ) as Coverage;

  const modulesSizes = new Map();
  MODULES.forEach((module) => {
    const moduleSizes = new Map();
    moduleSizes.set(
      'js',
      statSync('./dist/' + (module ? module + '/' : '') + 'index.js').size,
    );
    moduleSizes.set(
      'gz',
      statSync('./dist/min/' + (module ? module + '/' : '') + 'index.js.gz')
        .size,
    );
    modulesSizes.set(module, moduleSizes);
  });

  const {name, version, repository, license} = JSON.parse(
    readFileSync('./package.json', 'utf-8'),
  );
  const metadata = {
    package: `https://www.npmjs.com/package/${name}/v/${version}`,
    version,
    repository: repository.replace(/^github:/, 'https://github.com/'),
    license,
  };

  return {coverage, metadata, modulesSizes};
})();

const Context = createContext<Build>(build);

type Props = {children?: ReactNode};

export const BuildContext: FunctionComponent<Props> = ({
  children,
}: Props): any => children;

export const useCoverage = (): Coverage => useContext(Context).coverage;
export const useMetadata = (): Metadata => useContext(Context).metadata;
export const useModulesSizes = (): ModulesSizes =>
  useContext(Context).modulesSizes;
