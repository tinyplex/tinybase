import type {NoPropComponent} from 'tinydocs';
import {NodeNavigation, useIsSingle, usePageNode, useRootNode} from 'tinydocs';
import {ArticleInner} from './ArticleInner.tsx';
import {Home} from './Home.tsx';

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
          <nav aria-label="Documentation">
            <ul>
              <NodeNavigation node={isSingle ? pageNode : rootNode} />
            </ul>
          </nav>
          <article id="content" tabIndex={-1}>
            <ArticleInner />
          </article>
          <aside aria-label="On this page" />
        </>
      )}
    </main>
  );
};
