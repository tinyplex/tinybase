import {
  NoPropComponent,
  NodeBreadcrumbs,
  NodeSection,
  usePageNode,
  useRootNode,
} from 'tinydocs';
import React from 'react';

export const ArticleInner: NoPropComponent = (): any => {
  const rootNode = useRootNode();
  const pageNode = usePageNode();

  return (
    <>
      <nav>
        <ul>
          <NodeBreadcrumbs node={rootNode} />
        </ul>
      </nav>
      <NodeSection node={pageNode} />
    </>
  );
};
