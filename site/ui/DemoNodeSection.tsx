import React, {FunctionComponent} from 'react';
import {Markdown, type Node} from 'tinydocs';

type DemoNode = Node & {__demoDoc?: string};

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

export const DemoNodeSection: FunctionComponent<{node: Node}> = ({node}) => {
  const {__demoDoc: demoDoc, body, id, name, summary, url} = node as DemoNode;

  return (
    <section className="s1" id={url} data-id={id}>
      <h1>{name}</h1>
      {demoDoc == null ? null : <iframe srcDoc={demoDoc} />}
      {summary == null ? null : (
        <Markdown markdown={bumpMarkdownHeadings(summary)} />
      )}
      {body == null ? null : <Markdown markdown={bumpMarkdownHeadings(body)} />}
    </section>
  );
};
