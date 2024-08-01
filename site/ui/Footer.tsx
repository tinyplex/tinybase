/* eslint-disable react/jsx-no-target-blank */
import type {NoPropComponent} from 'tinydocs';
import React from 'react';

export const Footer: NoPropComponent = () => (
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
      <a href="/">
        TinyBase <span id="version" />
      </a>{' '}
      © 2021- All Rights Reserved
    </nav>
  </footer>
);
