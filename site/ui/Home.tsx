import {Markdown, NoPropComponent, usePageNode} from 'tinydocs';
import React from 'react';
import {useReadme} from './Readme';

export const Home: NoPropComponent = (): any => {
  const [summary, body] = useReadme(usePageNode());

  return (
    <article id="home">
      <img src="/favicon.svg" />
      <Markdown markdown={summary} html={true} />
      <Markdown markdown={body} html={true} />
    </article>
  );
};
