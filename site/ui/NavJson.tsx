import type {NoPropComponent, Node} from 'tinydocs';
import {
  getSkippedChildren,
  isAncestorOrSame,
  useIsSingle,
  usePageNode,
  useRootNode,
} from 'tinydocs';
import React from 'react';

export type NavNode = {
  i: string; // id
  n: string; // name
  u: string; // url
  r?: 1; // reflection
  c?: 1; // current
  p?: 1; // parent
  o?: 1; // open
  _?: NavNode[]; // children
};

export const NavJson: NoPropComponent = (): any => {
  const rootNode = useRootNode();
  const pageNode = usePageNode();
  const isSingle = useIsSingle();

  return (
    <code
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getNav(rootNode, pageNode, isSingle)),
      }}
    />
  );
};

const getNav = (node: Node, pageNode: Node, isSingle: boolean): NavNode => {
  const navNode: NavNode = {
    i: node.id,
    n: node.name,
    u: (isSingle ? '#' : '') + node.url,
  };

  const children = getSkippedChildren(node);
  const isParent = children.length > 0;
  const isOpen = isSingle || isAncestorOrSame(pageNode, node);

  if (node.reflection != null) {
    navNode.r = 1;
  }
  if (!isSingle && node == pageNode) {
    navNode.c = 1;
  }
  if (isParent) {
    navNode.p = 1;
    if (isOpen) {
      navNode.o = 1;
    }
  }

  if (isOpen && isParent) {
    navNode._ = children.map((node) => getNav(node, pageNode, isSingle));
  }

  return navNode;
};
