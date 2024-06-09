import {
  addClass,
  createElement,
  delClass,
  doc,
  preLoad,
  query,
  queryById,
  queryElement,
  toggleClass,
} from './common.ts';
import type {NavNode} from '../ui/NavJson.tsx';

preLoad();

addEventListener('load', () => {
  const nav: HTMLElement = query('body > main > nav');
  const article: HTMLElement = query('body > main > article');
  if (nav == null || article == null) {
    return;
  }

  const addPen = () => {
    const iframe = queryElement(article, ':scope iframe');
    const iframeParent = iframe?.parentElement;
    if (iframe == null || iframeParent == null) {
      return;
    }
    const form = iframeParent.insertBefore(
      createElement('form', null, {
        action: 'https://codepen.io/pen/define',
        method: 'post',
        target: '_blank',
      }),
      iframe,
    ) as HTMLFormElement;
    iframeParent.insertBefore(
      createElement('a', null, {id: 'penEdit'}, 'Open this demo in CodePen'),
      iframe,
    ).onclick = () => {
      if (form.childNodes.length == 0) {
        fetch('pen.json')
          .then((response) => response.text())
          .then((rawJson) => {
            createElement('input', form, {
              type: 'hidden',
              name: 'data',
              value: rawJson,
            });
            form.submit();
          });
      } else {
        form.submit();
      }
    };
  };
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
      history.pushState(null, '', href);
    }
  });

  window.onpopstate = function (event: PopStateEvent) {
    // if (!location.href.includes('#')) {
    go(location.href);
    event.preventDefault();
    // }
  };

  const openClose = (li: HTMLElement) =>
    toggleClass(li, 'open', () => {
      const a = queryElement(li, 'a') as HTMLAnchorElement;
      if (a.href != location.origin) {
        a.click();
      }
    });

  const go = (href: string): void => {
    ['?', '#'].forEach((separator) => {
      if (href.includes(separator)) {
        href = href.substring(0, href.indexOf(separator));
      }
    });
    fetch(`${href}nav.json`)
      .then((response) => response.json())
      .then((navJson) => {
        delClass(queryElement(nav, 'li.current'), 'current');
        updateNav(navJson, queryElement(nav, 'ul'));
      });
    fetch(`${href}article.html`)
      .then((response) => response.text())
      .then((html) => updateArticle(html));
  };

  const updateNav = (
    {
      i: id,
      n: name,
      u: url,
      r: reflection,
      c: current,
      p: parent,
      o: open,
      _: children,
    }: NavNode,
    ul: HTMLElement,
  ): void => {
    let li = queryById(id);
    if (li == null) {
      li = createElement('li', ul, {id});
      createElement('span', li);
      const a = createElement('a', li, {href: url});
      if (reflection) {
        createElement('code', a, {}, name);
      } else {
        a.innerText = name;
      }
      if (parent) {
        addClass(li, 'parent');
      }
    }
    if (open) {
      addClass(li, 'open');
    }
    if (children != null) {
      const childUl: HTMLElement =
        queryElement(li, 'ul') ?? createElement('ul', li);
      children.forEach((child) => {
        updateNav(child, childUl);
      });
    }
    if (current) {
      addClass(li, 'current');
      doc.title = `${name} | TinyBase`;
      const liRect = li.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      if (liRect.top < navRect.top) {
        nav.scrollBy(0, liRect.top - navRect.top);
      } else if (liRect.bottom > navRect.bottom) {
        nav.scrollBy(
          0,
          Math.min(liRect.bottom - navRect.bottom, liRect.top - navRect.top),
        );
      }
    }
  };

  const updateArticle = (html: string): void => {
    article.innerHTML = html;
    article.scrollTo(0, 0);
    addPen();
  };
});
