import {Markdown, NoPropComponent, usePageNode} from 'tinydocs';
import {useCoverage, useMetadata, useSizes} from './BuildContext';
import {Node} from 'tinydocs';
import React from 'react';

export const Readme: NoPropComponent = (): any => {
  const [summary, body] = useReadme(usePageNode());
  const markdown = summary + '\n\n' + body;

  return <Markdown markdown={markdown} html={true} skipCode={true} />;
};

const MODULES = [
  'store',
  'indexes',
  'metrics',
  'relationships',
  'checkpoints',
  'persisters',
  'common',
  'tinybase',
];

const toKb = (bytes: number) => `${(bytes / 1000).toFixed(1)}kB`;

export const useReadme = (node: Node): [string, string] => {
  const metadata = useMetadata();
  const sizes = useSizes();
  const coverage = useCoverage();

  Object.entries({
    toKb,
    metadata,
    sizes,
    coverage,
    getSizeTable: () => getSizeTable(sizes),
    getCoverageTable: () => getCoverageTable(coverage),
  }).forEach(([key, value]) => {
    globalThis[key] = value;
  });

  const substituteEval = (markdown: string): string =>
    markdown.replace(/@@EVAL\("(.*?)"\)/gms, (_, script) => (0, eval)(script));

  return [substituteEval(node.summary), substituteEval(node.body)];
};

const getSizeTable = (sizes) =>
  `<table class='fixed'>
    <tr>
      <th width='30%'>&nbsp;</th>
      <th>.js.gz</th>
      <th>.js</th>
      <th>debug.js</th>
      <th>.d.ts</th>
    </tr>
    ${MODULES.map(
      (module) =>
        `<tr>
          <th class='right'><a href='/api/${module}'>${module}</a></th>
          <td>${toKb(sizes.get(`${module}.js.gz`))}</td>
          <td>${toKb(sizes.get(`${module}.js`))}</td>
          <td>${toKb(sizes.get(`debug-${module}.js`))}</td>
          <td>${toKb(sizes.get(`${module}.d.ts`))}</td>
        </tr>`,
    ).join('')}
  </table>`;

const getCoverageTable = (coverage) =>
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
