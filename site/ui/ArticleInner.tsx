import type {NoPropComponent} from 'tinydocs';
import {NodeBreadcrumbs, NodeSection, usePageNode, useRootNode} from 'tinydocs';
import {DemoNodeSection} from './DemoNodeSection.tsx';

export const ArticleInner: NoPropComponent = (): any => {
  const rootNode = useRootNode();
  const pageNode = usePageNode();
  const isHome = pageNode == rootNode;
  const hasFiles = Object.keys(pageNode.executables?.files ?? {}).length > 0;

  return isHome ? null : (
    <>
      <nav>
        <ul>
          <NodeBreadcrumbs node={rootNode} />
        </ul>
      </nav>
      {hasFiles ? (
        <DemoNodeSection node={pageNode} />
      ) : (
        <NodeSection node={pageNode} />
      )}
    </>
  );
};
