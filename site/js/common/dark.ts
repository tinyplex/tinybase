import {query} from './common.ts';

const DARK = 'dark';
const LIGHT = 'light';
const AUTO = 'auto';

export const darkLoad = () => {
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
