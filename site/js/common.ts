export const doc = document;

export const query = (query: string): HTMLElement => doc.querySelector(query);
export const queryElement = (
  element: HTMLElement,
  query: string,
): HTMLElement => element.querySelector(query);
export const queryById = (id: string): HTMLElement => doc.getElementById(id);

export const createElement = (
  tagName: string,
  parent: HTMLElement,
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

const editClass = (
  element: HTMLElement,
  edit: string,
  callback: (classes: string[], position) => void,
): void => {
  const classes = (element.className ?? '').split(' ');
  callback(classes, classes.indexOf(edit));
  element.className = classes.join(' ');
};

export const addClass = (element: HTMLElement, add: string): void =>
  editClass(element, add, (classes, position) =>
    position == -1 ? classes.push(add) : null,
  );

export const delClass = (element: HTMLElement, del: string): void =>
  editClass(element, del, (classes, position) =>
    position != -1 ? classes.splice(position, 1) : null,
  );

export const toggleClass = (
  element: HTMLElement,
  toggle: string,
  added: () => void,
): void =>
  editClass(element, toggle, (classes, position) =>
    position != -1
      ? classes.splice(position, 1)
      : classes.push(toggle) && added(),
  );

const DARK = 'dark';
const LIGHT = 'light';
const AUTO = 'auto';

export const preLoad = () => darkMode();

const darkMode = () => {
  const pref = matchMedia('(prefers-color-scheme: dark)');
  const update = () => {
    const dark = localStorage.getItem(DARK) ?? AUTO;
    query('#dark')?.setAttribute('class', dark);
    query('html').className =
      dark == DARK || (dark == AUTO && pref.matches) ? DARK : LIGHT;
  };
  pref.addEventListener('change', update);
  window.addEventListener('storage', (event) => {
    if (event.storageArea == localStorage && event.key == DARK) {
      update();
    }
  });
  addEventListener('load', () => {
    query('#dark').addEventListener('click', () => {
      const dark = localStorage.getItem(DARK);
      localStorage.setItem(
        DARK,
        dark == DARK ? LIGHT : dark == LIGHT ? AUTO : DARK,
      );
      update();
    });
    update();
  });
  update();
};
