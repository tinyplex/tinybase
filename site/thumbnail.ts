import type {Node} from 'tinydocs';

export type Thumbnail = {
  readonly alt: string;
  readonly src: string;
  readonly title?: string;
};

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

export const getThumbnailMarkdown = (
  node: Node,
): {thumbnail?: Thumbnail; summary: string; body: string} => {
  const summaryParts = splitLeadingImage(node.summary);
  const bodyParts = splitLeadingImage(node.body);
  return summaryParts.thumbnail == null
    ? {
        thumbnail: bodyParts.thumbnail,
        summary: summaryParts.markdown,
        body: bodyParts.markdown,
      }
    : {
        thumbnail: summaryParts.thumbnail,
        summary: summaryParts.markdown,
        body: node.body ?? '',
      };
};

export const getSummaryMarkdown = (node: Node): string => {
  const {body, summary} = getThumbnailMarkdown(node);
  return summary || getLeadParagraph(body);
};
