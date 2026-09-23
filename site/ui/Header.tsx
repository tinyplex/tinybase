import type {NoPropComponent} from 'tinydocs';
import {NodeChildren, useRootNode} from 'tinydocs';
import {usePackageData} from './BuildContext.tsx';

export const Header: NoPropComponent = () => {
  const {version} = usePackageData();
  const rootNode = useRootNode();

  return (
    <header>
      <a href="/">
        <img src="/favicon.svg" alt="TinyBase logo" />
        <span>
          TinyBase
          {version.includes('beta') && (
            <>
              {' '}
              <em>&beta;</em>
            </>
          )}
        </span>
      </a>
      <input id="menustate" type="checkbox" aria-label="Menu" />
      <label id="hamburger" htmlFor="menustate" aria-hidden="true" />
      <nav aria-label="Primary">
        <ul>
          <NodeChildren node={rootNode} />
          <li>
            <a href="https://github.com/tinyplex/tinybase">GitHub</a>
          </li>
        </ul>
      </nav>
      <button
        id="dark"
        type="button"
        aria-label="Color theme: automatic; activate for dark"
      />
    </header>
  );
};
