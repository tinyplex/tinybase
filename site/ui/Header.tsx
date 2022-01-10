import {NoPropComponent, NodeChildren, useRootNode} from 'tinydocs';
import React from 'react';

export const Header: NoPropComponent = () => {
  const rootNode = useRootNode();

  return (
    <header>
      <a href="/">
        <img src="/favicon.svg" />
        <span>TinyBase</span>
      </a>
      <nav>
        <ul>
          <NodeChildren node={rootNode} />
          <li>
            <a href="https://github.com/tinyplex/tinybase">GitHub</a>
          </li>
        </ul>
      </nav>
      <span id="dark" />
    </header>
  );
};
