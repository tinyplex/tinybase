import prettier from '@prettier/sync';
import React from 'react';
import type {NoPropComponent} from 'tinydocs';
import {usePageNode} from 'tinydocs';

export const ExecutablePen: NoPropComponent = (): any => {
  const {name: title, summary: description, executables} = usePageNode();
  if (executables == null) {
    return null;
  }

  const {html = '', less = '', tsx = ''} = executables;

  const pen = {
    title,
    description,
    html: prettier.format(html, {parser: 'html'}).trim(),
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
