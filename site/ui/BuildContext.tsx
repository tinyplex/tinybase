import {FunctionComponent, ReactNode, createContext, useContext} from 'react';
import {readFileSync, statSync} from 'fs';
import {basename} from 'path';
import {forEachDirAndFile} from 'tinydocs';

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
export type Sizes = Map<string, number>;

type Build = {
  coverage: Coverage;
  metadata: Metadata;
  sizes: Sizes;
};

const build = ((): Build => {
  const coverage = JSON.parse(
    readFileSync('./coverage.json', 'utf-8'),
  ) as Coverage;

  const sizes = new Map();
  forEachDirAndFile('./dist', null, (file) => {
    sizes.set(basename(file), statSync(file).size);
  });
  forEachDirAndFile('./dist/types', null, (file) => {
    sizes.set(basename(file), statSync(file).size);
  });
  forEachDirAndFile('./dist/debug', null, (file) => {
    sizes.set(`debug-${basename(file)}`, statSync(file).size);
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

  return {coverage, metadata, sizes};
})();

const Context = createContext<Build>(build);

type Props = {children?: ReactNode};

export const BuildContext: FunctionComponent<Props> = ({
  children,
}: Props): any => children;

export const useCoverage = (): Coverage => useContext(Context).coverage;
export const useMetadata = (): Metadata => useContext(Context).metadata;
export const useSizes = (): Sizes => useContext(Context).sizes;
