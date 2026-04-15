import {FunctionComponent} from 'react';
import {Markdown, type Node} from 'tinydocs';
import {getThumbnailMarkdown} from '../thumbnail.ts';

const bumpMarkdownHeadings = (markdown: string): string => {
  let inFence = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (line.startsWith('```')) {
        inFence = !inFence;
        return line;
      }
      return inFence || !line.startsWith('#')
        ? line
        : line.replace(/^(#{1,5})(\s)/, '$1#$2');
    })
    .join('\n');
};

export const DemoNodeSection: FunctionComponent<{readonly node: Node}> = ({
  node,
}) => {
  const {id, name, url} = node;
  const {body, summary} = getThumbnailMarkdown(node);
  const srcDoc = (node as Node & {__demoDoc?: string}).__demoDoc;

  return (
    <section className="s1" id={url} data-id={id}>
      <h1>{name}</h1>
      <iframe srcDoc={srcDoc} />
      {summary == null ? null : (
        <Markdown markdown={bumpMarkdownHeadings(summary)} />
      )}
      {body == null ? null : <Markdown markdown={bumpMarkdownHeadings(body)} />}
    </section>
  );
};
