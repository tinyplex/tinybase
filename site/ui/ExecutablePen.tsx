import {useBaseUrl, usePageNode} from 'tinydocs';
import type {NoPropComponent} from 'tinydocs';
import React from 'react';
import prettier from '@prettier/sync';

const SCRIPTS_REGEX = /<script.*?<\/script>/gms;
const SRC_REGEX = /(?<=src=['"]).*?(?=['"])/gms;

export const ExecutablePen: NoPropComponent = (): any => {
  const baseUrl = useBaseUrl();

  const {name: title, summary: description, executables} = usePageNode();
  if (executables == null) {
    return null;
  }

  const {html = '', less = '', tsx = ''} = executables;

  const pen = {
    title,
    description,
    html: prettier
      .format(html.replace(SCRIPTS_REGEX, '').trim(), {parser: 'html'})
      .trim(),
    css: prettier.format(less, {parser: 'less'}).trim(),
    js: prettier
      .format(tsx, {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: false,
      })
      .trim(),
    css_pre_processor: 'less',
    js_pre_processor: 'typescript',
    js_external: (html.match(SCRIPTS_REGEX)?.join('')?.match(SRC_REGEX) ?? [])
      .map((script) => `${baseUrl}${script}`)
      .join(';'),
    editors: '012',
    tags: ['tinybase'],
  };

  return (
    <code
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: JSON.stringify(pen)}}
    />
  );
};
