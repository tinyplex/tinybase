/* eslint-disable react/jsx-no-target-blank */
import {NoPropComponent} from 'tinydocs';
import React from 'react';

export const Footer: NoPropComponent = () => {
  return (
    <footer>
      <nav>
        <a id="tw" href="https://twitter.com/tinybasejs" target="_blank" />
        <a id="fb" href="https://facebook.com/tinybasejs" target="_blank" />
      </nav>
      <nav>
        <a href="/">TinyBase</a> © 2021- All Rights Reserved
      </nav>
    </footer>
  );
};
