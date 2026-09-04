import {query} from './common.ts';

const DARK = 'dark';
const LIGHT = 'light';
const AUTO = 'auto';
const MODES = [AUTO, DARK, LIGHT] as const;
const LABELS = {[AUTO]: 'automatic', [DARK]: 'dark', [LIGHT]: 'light'} as const;

type Mode = (typeof MODES)[number];

let sessionMode: Mode = AUTO;

const getMode = (): Mode => {
  try {
    const stored = localStorage.getItem(DARK);
    sessionMode = MODES.includes(stored as Mode) ? (stored as Mode) : AUTO;
  } catch {}
  return sessionMode;
};

const setMode = (mode: Mode) => {
  sessionMode = mode;
  try {
    localStorage.setItem(DARK, mode);
  } catch {}
};

export const darkLoad = () => {
  const pref = matchMedia('(prefers-color-scheme: dark)');
  const update = () => {
    const mode = getMode();
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length] ?? AUTO;
    const toggle = query('#dark');
    toggle?.setAttribute('class', mode);
    toggle?.setAttribute('title', `Color theme: ${LABELS[mode]}`);
    toggle?.setAttribute(
      'aria-label',
      `Color theme: ${LABELS[mode]}; activate for ${LABELS[next]}`,
    );
    query('html').className =
      mode == DARK || (mode == AUTO && pref.matches) ? DARK : LIGHT;
  };
  pref.addEventListener('change', update);
  window.addEventListener('storage', (event) => {
    if (event.storageArea == localStorage && event.key == DARK) {
      update();
    }
  });
  addEventListener('load', () => {
    query('#dark').addEventListener('click', () => {
      const mode = getMode();
      setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length] ?? AUTO);
      update();
    });
    update();
  });
  update();
};
