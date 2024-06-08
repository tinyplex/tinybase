import {NodeNavigation, useIsSingle, usePageNode, useRootNode} from 'tinydocs';
import {ArticleInner} from './ArticleInner';
import {Home} from './Home';
import type {NoPropComponent} from 'tinydocs';
import React from 'react';

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
