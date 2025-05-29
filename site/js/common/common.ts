import type {NavNode} from '../../ui/NavJson.tsx';
import {thisVersion} from '../version.ts';

const SITE = 'TinyBase';

export const doc = document;

export const versionLoad = () => {
  addEventListener('load', () => {
    const version: HTMLElement = query('#version');
    version.innerText = thisVersion;
    version.style.width = version.scrollWidth + 'px';
  });
};

let nav: HTMLElement | null = null;
export const getNav = (): HTMLElement => (nav ??= query('body > main > nav'));

let article: HTMLElement | null = null;
export const getArticle = (): HTMLElement =>
  (article ??= query('body > main > article'));

export const preventDefault = (event: Event): void => event.preventDefault();

export const query = (query: string): HTMLElement =>
  doc.querySelector(query) as HTMLElement;
export const queryElement = (
  element: HTMLElement,
  query: string,
): HTMLElement => element.querySelector(query) as HTMLElement;
export const queryById = (id: string): HTMLElement =>
  doc.getElementById(id) as HTMLElement;

export const createElement = (
  tagName: string,
  parent?: HTMLElement | null,
  attributes: Record<string, string> = {},
  text?: string,
): HTMLElement => {
  const element = doc.createElement(tagName);
  Object.entries(attributes).forEach((attribute) =>
    element.setAttribute(...attribute),
  );
  if (text != null) {
    element.innerText = text;
  }
  return parent != null ? parent.appendChild(element) : element;
};

export const addClass = (element: HTMLElement, add: string): void =>
  element.classList.add(add);

export const hasClass = (element: HTMLElement, has: string): boolean =>
  element.classList.contains(has);

export const delClass = (element: HTMLElement, del: string): void =>
  element.classList.remove(del);

export const toggleClass = (
  element: HTMLElement,
  toggle: string,
  added: () => void,
) => (element.classList.toggle(toggle) ? added() : 0);

export const go = (href: string, updateUrl = true): void => {
  const nav = getNav();
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
    .then((html) => {
      const article = getArticle();
      article.innerHTML = html;
      article.scrollTo(0, 0);
      addPen();
    });

  if (updateUrl) {
    history.pushState(null, '', href);
  }
};

export const addPen = () => {
  const iframe = queryElement(getArticle(), ':scope iframe');
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
  const nav = getNav();
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
    doc.title = `${name} | ${SITE}`;
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
