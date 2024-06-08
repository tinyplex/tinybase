/* eslint-disable react/jsx-no-target-blank */
import type {NoPropComponent} from 'tinydocs';
import React from 'react';
import {useMetadata} from './BuildContext';

export const Footer: NoPropComponent = () => {
  const {version} = useMetadata();
  return (
    <footer>
      <nav>
        <a id="tw" href="https://twitter.com/tinybasejs" target="_blank">
          Twitter
        </a>
        <a id="fb" href="https://facebook.com/tinybasejs" target="_blank">
          Facebook
        </a>
      </nav>
      <nav>
        <a href="/">TinyBase {version}</a> © 2021- All Rights Reserved
      </nav>
    </footer>
  );
};
