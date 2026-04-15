import type {NoPropComponent} from 'tinydocs';
import {NodeBreadcrumbs, usePageNode, useRootNode} from 'tinydocs';
import {hasExecutables} from '../demo.ts';
import {DemoNodeSection} from './DemoNodeSection.tsx';
import {SiteNodeSection} from './SiteNodeSection.tsx';

export const ArticleInner: NoPropComponent = (): any => {
  const rootNode = useRootNode();
  const pageNode = usePageNode();
  const isHome = pageNode == rootNode;
  const isDemo = hasExecutables(pageNode);

  return isHome ? null : (
    <>
      <nav>
        <ul>
          <NodeBreadcrumbs node={rootNode} />
        </ul>
      </nav>
      {isDemo ? (
        <DemoNodeSection node={pageNode} />
      ) : (
        <SiteNodeSection node={pageNode} />
      )}
    </>
  );
};
