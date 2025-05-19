import {
  addPen,
  doc,
  go,
  queryElement,
  toggleClass,
  versionLoad,
} from './common/common.ts';
import {darkLoad} from './common/dark.ts';
import {searchLoad} from './common/search.ts';

versionLoad();
darkLoad();
searchLoad();

addEventListener('load', () => {
  addPen();

  doc.body.addEventListener('click', (event: MouseEvent) => {
    if (event.button != 0) {
      return;
    }
    let target: HTMLElement = event.target as any;

    if (
      target.tagName == 'SPAN' &&
      target.innerHTML == '' &&
      target.parentElement?.tagName == 'LI'
    ) {
      return openClose(target.parentElement);
    }

    while (target.tagName != 'A' && target.parentElement != null) {
      target = target.parentElement;
    }

    const href = (target as HTMLAnchorElement).href;
    if (
      !event.metaKey &&
      !event.shiftKey &&
      href != null &&
      href != location.origin + '/' &&
      href.startsWith(location.origin + '/') &&
      !href.includes('#')
    ) {
      go(href);
      event.preventDefault();
    }
  });

  window.onpopstate = function (event: PopStateEvent) {
    if (!location.href.includes('#')) {
      go(location.href, false);
      event.preventDefault();
    }
  };

  const openClose = (li: HTMLElement) =>
    toggleClass(li, 'open', () => {
      const a = queryElement(li, 'a') as HTMLAnchorElement;
      if (a.href != location.origin) {
        a.click();
      }
    });
});
