import React, {FunctionComponent} from 'react';
import {Markdown, type Node} from 'tinydocs';

type DemoNode = Node & {__demoDoc?: string};

export const DemoNodeSection: FunctionComponent<{node: Node}> = ({node}) => {
  const {__demoDoc: demoDoc, body, id, name, summary, url} = node as DemoNode;

  return (
    <section className="s1" id={url} data-id={id}>
      <h1>{name}</h1>
      {demoDoc == null ? null : <iframe srcDoc={demoDoc} />}
      {summary == null ? null : <Markdown markdown={summary} />}
      {body == null ? null : <Markdown markdown={body} />}
    </section>
  );
};
