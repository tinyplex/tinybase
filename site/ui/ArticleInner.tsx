import {NodeBreadcrumbs, NodeSection, usePageNode, useRootNode} from 'tinydocs';
import type {NoPropComponent} from 'tinydocs';
import React from 'react';

export const ArticleInner: NoPropComponent = (): any => {
  const rootNode = useRootNode();
  const pageNode = usePageNode();
  const isHome = pageNode == rootNode;

  return isHome ? null : (
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
