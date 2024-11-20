/* eslint-disable react/jsx-no-target-blank */
import type {NoPropComponent} from 'tinydocs';
import React from 'react';

export const Footer: NoPropComponent = () => (
  <footer>
    <nav>
      <a id="gh" href="https://github.com/tinyplex/tinybase" target="_blank">
        GitHub
      </a>
      <a
        id="bs"
        href="https://bsky.app/profile/tinybase.bsky.social"
        target="_blank"
      >
        Bluesky
      </a>
      <a id="tw" href="https://x.com/tinybasejs" target="_blank">
        X / Twitter
      </a>
      <a id="dc" href="https://discord.com/invite/mGz3mevwP8" target="_blank">
        Discord
      </a>
    </nav>
    <nav>
      <a href="/">
        TinyBase <span id="version" />
      </a>{' '}
      © 2022- All Rights Reserved
    </nav>
  </footer>
);
