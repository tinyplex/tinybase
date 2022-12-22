import {Markdown, NoPropComponent, usePageNode} from 'tinydocs';
import React from 'react';
import {useReadme} from './Readme';

export const Home: NoPropComponent = (): any => {
  const [summary, body] = useReadme(usePageNode());

  return (
    <article id="home">
      <img
        src="/favicon.svg"
        alt="Large TinyBase logo"
        width="100%"
        height="100%"
      />
      <Markdown markdown={summary} html={true} />
      <Markdown markdown={body} html={true} />
    </article>
  );
};
