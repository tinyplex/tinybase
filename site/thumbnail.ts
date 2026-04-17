import type {Node, NodeTransform} from 'tinydocs';

export type Thumbnail = {
  readonly alt: string;
  readonly src: string;
  readonly title?: string;
};
const THUMBNAIL = 'thumbnail';

const removeLeadingWhitespace = (markdown: string): string =>
  markdown.replace(/^\s*\n+/, '');

const getLeadParagraph = (markdown: string): string =>
  removeLeadingWhitespace(markdown).split('\n\n')[0] ?? '';

const parseLeadingImage = (markdown: string): Thumbnail | undefined => {
  const match = markdown.match(
    /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/,
  );
  return match == null
    ? undefined
    : {
        alt: match[1] ?? '',
        src: match[2] ?? '',
        ...(match[3] == null ? {} : {title: match[3]}),
      };
};

const splitLeadingImage = (
  markdown: string | undefined,
): {thumbnail?: Thumbnail; markdown: string} => {
  const source = markdown ?? '';
  const trimmed = source.replace(/^\s+/, '');
  const [firstLine = ''] = trimmed.split('\n');
  const thumbnail = parseLeadingImage(firstLine.trim());
  return thumbnail == null
    ? {markdown: source}
    : {
        thumbnail,
        markdown: removeLeadingWhitespace(trimmed.slice(firstLine.length)),
      };
};

export const extractThumbnailMarkdown: NodeTransform = (node) => {
  if (node.reflection != null) {
    return;
  }
  const summaryParts = splitLeadingImage(node.summary);
  const bodyParts = splitLeadingImage(node.body);
  node.data[THUMBNAIL] = summaryParts.thumbnail ?? bodyParts.thumbnail;
  node.summary = summaryParts.markdown;
  node.body =
    summaryParts.thumbnail == null ? bodyParts.markdown : (node.body ?? '');
};

export const getThumbnailMarkdown = (
  node: Node,
): {thumbnail?: Thumbnail; summary: string; body: string} => ({
  thumbnail: node.data[THUMBNAIL] as Thumbnail | undefined,
  summary: node.summary ?? '',
  body: node.body ?? '',
});

export const getSummaryMarkdown = (node: Node): string => {
  return (node.summary ?? '') || getLeadParagraph(node.body ?? '');
};
