import {Markdown, usePageNode} from 'tinydocs';
import type {NoPropComponent, Node} from 'tinydocs';
import {useCoverage, useMetadata, useModulesSizes} from './BuildContext.tsx';
import {MODULES} from './common.ts';
import type {ModulesSizes} from './BuildContext.tsx';
import React from 'react';

export const Readme: NoPropComponent = (): any => {
  const [summary, body] = useReadme(usePageNode());
  const markdown = summary + '\n\n' + body;

  return <Markdown markdown={markdown} html={true} skipCode={true} />;
};

const toKb = (bytes: number | undefined) =>
  bytes != null ? `${(bytes / 1000).toFixed(1)}kB` : '';

export const useReadme = (node: Node): [string, string] => {
  const metadata = useMetadata();
  const modulesSizes = useModulesSizes();
  const coverage = useCoverage();

  Object.entries({
    toKb,
    metadata,
    modulesSizes,
    coverage,
    getSizeTable: () => getSizeTable(modulesSizes),
    getCoverageTable: () => getCoverageTable(coverage),
    getGitHubAvatar,
  }).forEach(([key, value]) => {
    (globalThis as any)[key] = value;
  });

  const substituteEval = (markdown: string): string =>
    markdown.replace(/@@EVAL\("(.*?)"\)/gms, (_, script) => (0, eval)(script));

  return [substituteEval(node.summary ?? ''), substituteEval(node.body ?? '')];
};

const getSizeTable = (modulesSizes: ModulesSizes) =>
  `<table class='fixed'>
    <tr>
      <th>&nbsp;</th>
      <th>Minified .js.gz</th>
      <th>Source .js</th>
    </tr>
    ${MODULES.map(
      (module) =>
        `<tr>
          <th class='right'>${
            module == 'store'
              ? `<a href='/api/${module}/'>tinybase/store</a>&nbsp;(minimal)`
              : module == ''
                ? 'tinybase&nbsp;(complete)'
                : `<a href='/api/${module}/'>${module}</a>`
          }</th>
          <td>${toKb(modulesSizes.get(module)?.get('gz'))}</td>
          <td>${toKb(modulesSizes.get(module)?.get('js'))}</td>
        </tr>`,
    ).join('')}
  </table>`;

const getCoverageTable = (coverage: any) =>
  `<table class='fixed'>
    <tr>
      <th width='30%'>&nbsp;</th>
      <th>Total</th>
      <th>Tested</th>
      <th>Coverage</th>
    </tr>
    ${['lines', 'statements', 'functions', 'branches', 'tests', 'assertions']
      .map(
        (type) =>
          `<tr>
            <th class='right'>${type[0].toUpperCase() + type.substring(1)}</th>
            ${
              typeof coverage[type] == 'object'
                ? `<td>${coverage[type].total.toLocaleString()}</td>
                    <td>${coverage[type].covered.toLocaleString()}</td>
                    <td>${coverage[type].pct.toFixed(1)}%</td>`
                : `<td colSpan='3'>${coverage[type].toLocaleString()}</td>`
            }
          </tr>`,
      )
      .join('')}
 </table>`;

const getGitHubAvatar = (username: string) =>
  `<a href='https://github.com/${username}' target='_blank'><img 
      title='${username}' src='https://github.com/${username}.png?size=48' 
      width='48' height='48' /></a>`;
