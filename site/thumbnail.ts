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

const IMAGE_MARKDOWN =
  /!\[([^\]]*)\]\(\s*([^) \t\r\n]+)\s*(?:(?:"([^"]*)"|'([^']*)'))?\s*\)/;

const getThumbnailFromMatch = (match: RegExpMatchArray): Thumbnail => ({
  alt: match[1] ?? '',
  src: match[2] ?? '',
  ...(
    match[3] == null && match[4] == null
      ? {}
      : {title: match[3] ?? match[4]}
  ),
});

const parseLeadingImage = (markdown: string): Thumbnail | undefined => {
  const match = markdown.match(
    new RegExp(`^${IMAGE_MARKDOWN.source}\\s*$`),
  );
  return match == null
    ? undefined
    : getThumbnailFromMatch(match);
};

const findFirstImage = (markdown?: string): Thumbnail | undefined => {
  const match = markdown?.match(IMAGE_MARKDOWN);
  return match == null ? undefined : getThumbnailFromMatch(match);
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

const getCommentText = (
  parts: {text: string}[] | undefined,
): string | undefined => parts?.map(({text}) => text).join('');

const getCommentTexts = (
  comment: {summary?: {text: string}[]} | undefined,
): [string, string | undefined] | [undefined, undefined] => {
  const text = getCommentText(comment?.summary);
  if (!text) {
    return [undefined, undefined];
  }
  const lineBreak = text.indexOf('\n\n');
  return lineBreak > -1
    ? [text.slice(0, lineBreak), text.slice(lineBreak)]
    : [text, undefined];
};

const getReflectionMarkdown = (reflection: any): string[] => [
  ...getCommentTexts(reflection.comment),
  ...getCommentTexts(reflection?.signatures?.[0]?.comment),
  ...getCommentTexts(reflection?.reflectionComment?.signatures?.[0]?.comment),
  ...getCommentTexts(reflection?.type?.declaration?.signatures?.[0]?.comment),
  ...getCommentTexts(reflection?.type?.declaration?.comment),
].filter((markdown): markdown is string => markdown != null);

export const extractThumbnailMarkdown: NodeTransform = (node) => {
  if (node.reflection != null) {
    node.data[THUMBNAIL] = getReflectionMarkdown(node.reflection)
      .map((markdown) => findFirstImage(markdown))
      .find((thumbnail) => thumbnail != null);
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
