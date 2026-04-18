import React, {
  FunctionComponent,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from 'react';
import {
  Markdown,
  NodeName,
  NodeSection,
  NodeSummary,
  getSkippedChildren,
  useIsSingle,
  type Node,
} from 'tinydocs';
import {getSummaryMarkdown, getThumbnailMarkdown} from '../thumbnail.ts';

type Props = {readonly node: Node; readonly summary?: boolean};

const SectionLevel = createContext<{level: number}>({level: 1});

const getReadMore = (readMore: boolean, isSingle: boolean, node: Node) =>
  readMore ? ` [Read more](${(isSingle ? '#' : '') + node.url}).` : '';

const getThumbnailTitle = (thumbnail: {
  readonly alt: string;
  readonly title?: string;
}): string =>
  thumbnail.title == null || thumbnail.title == 'Thumbnail'
    ? thumbnail.alt
    : thumbnail.title;

const SiteSection: FunctionComponent<{
  readonly children?: ReactNode;
  readonly dataId?: string;
  readonly id?: string;
  readonly thumbnail?: {
    readonly alt: string;
    readonly src: string;
    readonly title?: string;
  };
  readonly title: ReactNode;
}> = ({children, dataId, id, thumbnail, title}) => {
  const {level} = useContext(SectionLevel);
  const heading = React.createElement(`h${Math.min(level, 6)}`, {}, title);

  return (
    <SectionLevel.Provider value={useMemo(() => ({level: level + 1}), [level])}>
      <section
        className={`s${level}${thumbnail == null ? '' : ' withThumbnail'}`}
        {...(id == null ? {} : {id})}
        {...(dataId == null ? {} : {'data-id': dataId})}
      >
        {thumbnail == null ? (
          <>
            {heading}
            {children}
          </>
        ) : (
          <div className="thumbnailPanel">
            <a href={id}>
              <img
                src={thumbnail.src}
                alt={thumbnail.alt}
                title={getThumbnailTitle(thumbnail)}
              />
            </a>
            <div>
              {heading}
              {children}
            </div>
          </div>
        )}
      </section>
    </SectionLevel.Provider>
  );
};

export const SiteNodeSection: FunctionComponent<Props> = ({
  node,
  summary = false,
}) => {
  const isSingle = useIsSingle();
  if (node.reflection != null) {
    return summary && !isSingle ? (
      <SiteReflectionSummary node={node} />
    ) : (
      <NodeSection node={node} summary={summary} />
    );
  }

  const children = getSkippedChildren(node);
  return isSingle || !summary ? (
    <SiteNodeSectionBlock node={node}>
      {children.map((child, key) => (
        <SiteNodeSection node={child} key={key} summary={true} />
      ))}
    </SiteNodeSectionBlock>
  ) : (
    <SiteNodeSectionBlock node={node} summary={true}>
      {children.length == 0 ? null : (
        <ul>
          {children.map((child, key) => (
            <SiteNodeSectionItem key={key} node={child} />
          ))}
        </ul>
      )}
    </SiteNodeSectionBlock>
  );
};

const SiteReflectionSummary: FunctionComponent<{readonly node: Node}> = ({
  node,
}) => {
  const children = getSkippedChildren(node);
  const {thumbnail} = getThumbnailMarkdown(node);
  const parts = [<NodeSummary node={node} key="summary" readMore={true} />];

  if (children.length > 0) {
    parts.push(
      <ul key="children">
        {children.map((child, key) => (
          <SiteNodeSectionItem key={key} node={child} />
        ))}
      </ul>,
    );
  }
  if (node.essential) {
    parts.unshift(
      <div className="essential" key="essential">
        Essential
      </div>,
    );
  }

  return (
    <SiteSection
      title={<NodeName node={node} />}
      id={node.url}
      dataId={node.id}
      thumbnail={thumbnail}
    >
      {parts}
    </SiteSection>
  );
};

const SiteNodeSectionBlock: FunctionComponent<{
  readonly children: ReactNode;
  readonly node: Node;
  readonly summary?: boolean;
}> = ({children, node, summary = false}) => {
  const isSingle = useIsSingle();
  const {body, summary: cleanedSummary, thumbnail} = getThumbnailMarkdown(node);
  const summaryMarkdown = getSummaryMarkdown(node);
  const parts = [];

  if (summary ? summaryMarkdown : cleanedSummary) {
    parts.push(
      <Markdown
        html={true}
        markdown={
          (summary ? summaryMarkdown : cleanedSummary) +
          getReadMore(summary, isSingle, node)
        }
        key="summary"
      />,
    );
  }
  if (!summary && body) {
    parts.push(<Markdown html={true} markdown={body} key="body" />);
  }
  parts.push(children);
  if (node.essential) {
    parts.unshift(
      <div className="essential" key="essential">
        Essential
      </div>,
    );
  }

  return (
    <SiteSection
      title={<NodeName node={node} />}
      id={node.url}
      dataId={node.id}
      thumbnail={summary ? thumbnail : undefined}
    >
      {parts}
    </SiteSection>
  );
};

const SiteNodeSectionItem: FunctionComponent<{readonly node: Node}> = ({
  node,
}) => {
  const children = getSkippedChildren(node);
  return (
    <li>
      <NodeName
        node={
          children.length == 1 && children[0].reflection != null
            ? children[0]
            : node
        }
        link={true}
      />
    </li>
  );
};
