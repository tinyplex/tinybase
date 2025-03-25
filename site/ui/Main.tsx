import {ArticleInner} from './ArticleInner.tsx';
import {Home} from './Home.tsx';
import React from 'react';
import {NodeNavigation, useIsSingle, usePageNode, useRootNode} from 'tinydocs';
import type {NoPropComponent} from 'tinydocs';

export const Main: NoPropComponent = () => {
  const pageNode = usePageNode();
  const rootNode = useRootNode();
  const isSingle = useIsSingle();
  const isHome = pageNode == rootNode;

  return (
    <main>
      {isHome ? (
        <Home />
      ) : (
        <>
          <nav>
            <ul>
              <NodeNavigation node={isSingle ? pageNode : rootNode} />
            </ul>
          </nav>
          <article>
            <ArticleInner />
          </article>
          <aside />
        </>
      )}
    </main>
  );
};
