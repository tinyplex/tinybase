import {NodeChildren, useRootNode} from 'tinydocs';
import type {NoPropComponent} from 'tinydocs';
import React from 'react';
import {useMetadata} from './BuildContext.tsx';

export const Header: NoPropComponent = () => {
  const {version} = useMetadata();
  const rootNode = useRootNode();

  return (
    <header>
      <a href="/">
        <img src="/favicon.svg" alt="TinyBase logo" />
        <span>
          TinyBase
          {version.includes('beta') && (
            <>
              {' '}
              <em title={version}>&beta;</em>
            </>
          )}
        </span>
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
