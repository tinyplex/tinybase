import type {NoPropComponent} from 'tinydocs';
import {Markdown, usePageNode} from 'tinydocs';

export const MarkdownPage: NoPropComponent = (): any => {
  const {summary, body} = usePageNode();
  const markdown = summary + '\n\n' + body;

  return <Markdown markdown={markdown} html={true} skipCode={true} />;
};
