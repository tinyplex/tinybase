import prettier from '@prettier/sync';
import type {NoPropComponent} from 'tinydocs';
import {usePageNode} from 'tinydocs';

const SCRIPTS_REGEX = /<script\b[^>]*>[\s\S]*?<\/script>/g;

const getLess = (source: string): string =>
  prettier.format(source, {parser: 'less'}).trim();

const getTsx = (source: string): string =>
  prettier
    .format(source, {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
    })
    .trim();

const getJs = (tsx: string): string =>
  tsx.trim() == ''
    ? ''
    : prettier
        .format(
          `const {code} = Babel.transform(await (await fetch('./index.tsx')).text(), {
            filename: 'index.tsx',
            presets: [
              ['typescript', {allExtensions: true, isTSX: true}],
              ['react', {runtime: 'automatic'}],
            ],
            sourceType: 'module',
          });

          await import(
            URL.createObjectURL(new Blob([code], {type: 'text/javascript'})),
          );`,
          {parser: 'babel', singleQuote: true, trailingComma: 'all'},
        )
        .trim();

const getHtml = (
  title: string,
  html: string,
  less: string,
  tsx: string,
): string => {
  const headScripts = html.match(SCRIPTS_REGEX)?.join('\n')?.trim() ?? '';
  const body = html.replace(SCRIPTS_REGEX, '').trim();
  const lessHead =
    less.trim() == ''
      ? ''
      : `
          <link rel="stylesheet/less" href="./index.less" />
          <script src="https://cdn.jsdelivr.net/npm/less@4"></script>
        `;
  const babelHead =
    tsx.trim() == ''
      ? ''
      : '<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js"></script>';
  return prettier
    .format(
      `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          ${headScripts}
          ${lessHead}
          ${babelHead}
        </head>
        <body>
          ${body}
          <script type="module" src="./index.js"></script>
        </body>
      </html>`,
      {parser: 'html'},
    )
    .trim();
};

export const ExecutableProject: NoPropComponent = (): any => {
  const {name: title, summary: description, executables} = usePageNode();
  if (executables == null) {
    return null;
  }

  const {html = '', less = '', tsx = ''} = executables;
  const project = {
    title,
    description,
    template: 'javascript',
    files: {
      'index.html': getHtml(title, html, less, tsx),
      'index.less': getLess(less),
      'index.tsx': getTsx(tsx),
      'index.js': getJs(tsx),
    },
    options: {
      file: tsx.trim() == '' ? 'index.html' : 'index.tsx',
      hidedevtools: '1',
      showSidebar: '1',
    },
  };

  return <code dangerouslySetInnerHTML={{__html: JSON.stringify(project)}} />;
};
