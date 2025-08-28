import {arrayJoin, arrayMap} from '../common/array.ts';
import {objNew, objToArray} from '../common/obj.ts';
import {UNIQUE_ID} from './common.ts';
import {
  ADD_SVG,
  CANCEL_SVG,
  CLONE_SVG,
  CLOSE_SVG,
  DELETE_SVG,
  DONE_SVG,
  DOWN_SVG,
  EDIT_SVG,
  LOGO_SVG,
  OK_SVG,
  OK_SVG_DISABLED,
  POSITIONS_SVG,
  RIGHT_SVG,
} from './svg.ts';

const SCROLLBAR = '*::-webkit-scrollbar';

const BACKGROUND = 'background';
const WIDTH = 'width';
const MAX_WIDTH = 'max-' + WIDTH;
const MIN_WIDTH = 'min-' + WIDTH;
const HEIGHT = 'height';
const BORDER = 'border';
const BORDER_RADIUS = BORDER + '-radius';
const PADDING = 'padding';
const MARGIN = 'margin';
const MARGIN_RIGHT = MARGIN + '-right';
const TOP = 'top';
const BOTTOM = 'bottom';
const LEFT = 'left';
const RIGHT = 'right';
const COLOR = 'color';
const POSITION = 'position';
const BOX_SHADOW = 'box-shadow';
const FONT_SIZE = 'font-size';
const DISPLAY = 'display';
const OVERFLOW = 'overflow';
const CURSOR = 'cursor';
const VERTICAL_ALIGN = 'vertical-align';
const TEXT_ALIGN = 'text-align';
const JUSTIFY_CONTENT = 'justify-content';

const FIXED = 'fixed';
const REVERT = 'revert';
const UNSET = 'unset';
const NONE = 'none';
const FLEX = 'flex';
const POINTER = 'pointer';
const AUTO = 'auto';
const HIDDEN = 'hidden';
const NOWRAP = 'nowrap';

const oklch = (lPercent: number, remainder = '% 0.01 ' + cssVar('hue')) =>
  `oklch(${lPercent}${remainder})`;
const cssVar = (name: string) => `var(--${name})`;
const rem = (...rems: number[]) => `${rems.join('rem ')}rem`;
const px = (...pxs: number[]) => `${pxs.join('px ')}px`;
const vw = (vw: number = 100) => `${vw}vw`;
const vh = (vh: number = 100) => `${vh}vh`;

export const APP_STYLESHEET = arrayJoin(
  objToArray(
    {
      '': {
        all: 'initial',
        [FONT_SIZE]: rem(0.75),
        [POSITION]: FIXED,
        'font-family': 'inter,sans-serif',
        'z-index': 999999,
        '--bg': oklch(20),
        '--bg2': oklch(15),
        '--bg3': oklch(25),
        '--bg4': oklch(30),
        '--fg': oklch(85),
        '--fg2': oklch(60),
        ['--' + BORDER]: px(1) + ' solid' + ' ' + cssVar('bg4'),
        ['--' + BOX_SHADOW]: px(0, 1, 2, 0) + ' ' + '#0007',
      },
      '*': {all: REVERT},
      '*::before': {all: REVERT},
      '*::after': {all: REVERT},

      [SCROLLBAR]: {[WIDTH]: rem(0.5), [HEIGHT]: rem(0.5)},
      [SCROLLBAR + '-thumb']: {[BACKGROUND]: cssVar('bg4')},
      [SCROLLBAR + '-thumb:hover']: {[BACKGROUND]: cssVar('bg4')},
      [SCROLLBAR + '-corner']: {[BACKGROUND]: NONE},
      [SCROLLBAR + '-track']: {[BACKGROUND]: NONE},

      img: {
        [WIDTH]: rem(0.8),
        [HEIGHT]: rem(0.8),
        [VERTICAL_ALIGN]: 'text-' + BOTTOM,
        [CURSOR]: POINTER,
        [MARGIN]: px(-2.5, 2, -2.5, 0),
        [PADDING]: px(2),
        [BORDER]: cssVar(BORDER),
        [BACKGROUND]: cssVar('bg3'),
        [BOX_SHADOW]: cssVar(BOX_SHADOW),
        [BORDER_RADIUS]: rem(0.25),
      },
      'img.flat': {[BORDER]: NONE, [BACKGROUND]: NONE, [BOX_SHADOW]: NONE},

      // Nub
      '>img': {
        [PADDING]: rem(0.25),
        [BOTTOM]: 0,
        [RIGHT]: 0,
        [POSITION]: FIXED,
        [HEIGHT]: UNSET,
        [MARGIN]: px(1),
        ...LOGO_SVG,
      },
      ...objNew(
        arrayMap(
          [
            {[BOTTOM]: 0, [LEFT]: 0},
            {[TOP]: 0, [RIGHT]: 0},
          ],
          (css, p) => [`>img[data-position='${p}']`, css],
        ),
      ),

      // Panel
      main: {
        [DISPLAY]: FLEX,
        [COLOR]: cssVar('fg'),
        [BACKGROUND]: cssVar('bg'),
        [OVERFLOW]: HIDDEN,
        [POSITION]: FIXED,
        [BOX_SHADOW]: cssVar(BOX_SHADOW),
        'flex-direction': 'column',
      },
      ...objNew(
        arrayMap(
          [
            {
              [BOTTOM]: 0,
              [LEFT]: 0,
              [WIDTH]: vw(35),
              [HEIGHT]: vh(),
              [BORDER + '-' + RIGHT]: cssVar(BORDER),
            },
            {
              [TOP]: 0,
              [RIGHT]: 0,
              [WIDTH]: vw(),
              [HEIGHT]: vh(30),
              [BORDER + '-' + BOTTOM]: cssVar(BORDER),
            },
            {
              [BOTTOM]: 0,
              [LEFT]: 0,
              [WIDTH]: vw(),
              [HEIGHT]: vh(30),
              [BORDER + '-' + TOP]: cssVar(BORDER),
            },
            {
              [TOP]: 0,
              [RIGHT]: 0,
              [WIDTH]: vw(35),
              [HEIGHT]: vh(),
              [BORDER + '-' + LEFT]: cssVar(BORDER),
            },
            {[TOP]: 0, [RIGHT]: 0, [WIDTH]: vw(), [HEIGHT]: vh()},
          ],
          (css, p) => [`main[data-position='${p}']`, css],
        ),
      ),

      // Header
      header: {
        [DISPLAY]: FLEX,
        [PADDING]: rem(0.5),
        [BOX_SHADOW]: cssVar(BOX_SHADOW),
        [BACKGROUND]: oklch(30, '% 0.008 var(--hue) / .5'),
        [WIDTH]: 'calc(100% - .5rem)',
        [POSITION]: 'absolute',
        [BORDER + '-' + BOTTOM]: cssVar(BORDER),
        'align-items': 'center',
        'backdrop-filter': 'blur(4px)',
      },
      'header>img:nth-of-type(1)': {
        [HEIGHT]: rem(1),
        [WIDTH]: rem(1),
        ...LOGO_SVG,
      },
      'header>img:nth-of-type(6)': CLOSE_SVG,
      ...objNew(
        arrayMap(POSITIONS_SVG, (SVG, p) => [
          `header>img[data-id='${p}']`,
          SVG,
        ]),
      ),
      'header>span': {
        [OVERFLOW]: HIDDEN,
        [FLEX]: 1,
        'font-weight': 800,
        'white-space': NOWRAP,
        'text-overflow': 'ellipsis',
      },

      // Body
      article: {[OVERFLOW]: AUTO, [FLEX]: 1, [PADDING + '-' + TOP]: rem(2)},

      details: {
        [MARGIN]: rem(0.5),
        [BORDER]: cssVar(BORDER),
        [BORDER_RADIUS]: rem(0.25),
      },
      summary: {
        [BACKGROUND]: cssVar('bg3'),
        [MARGIN]: px(-1),
        [BORDER]: cssVar(BORDER),
        [PADDING]: rem(0.25, 0.125),
        [DISPLAY]: FLEX,
        [BORDER_RADIUS]: rem(0.25),
        'user-select': NONE,
        [JUSTIFY_CONTENT]: 'space-between',
        'align-items': 'center',
      },
      'summary>span::before': {
        [DISPLAY]: 'inline-block',
        [VERTICAL_ALIGN]: 'sub',
        [MARGIN]: px(2),
        [WIDTH]: rem(1),
        [HEIGHT]: rem(1),
        ...RIGHT_SVG,
      },
      'details[open]>summary': {
        'border-bottom-left-radius': 0,
        'border-bottom-right-radius': 0,
        [MARGIN + '-' + BOTTOM]: 0,
      },
      'details[open]>summary>span::before': DOWN_SVG,
      'details>summary img': {[DISPLAY]: NONE},
      'details[open]>summary img': {
        [DISPLAY]: UNSET,
        [MARGIN + '-' + LEFT]: rem(0.25),
      },
      'details>div': {[OVERFLOW]: AUTO},

      caption: {
        [COLOR]: cssVar('fg2'),
        [PADDING]: rem(0.25, 0.5),
        [TEXT_ALIGN]: LEFT,
        'white-space': NOWRAP,
      },
      'caption button': {
        [WIDTH]: rem(1.5),
        [BORDER]: NONE,
        [BACKGROUND]: NONE,
        [COLOR]: cssVar('fg'),
        [PADDING]: 0,
        [CURSOR]: POINTER,
      },
      'caption button[disabled]': {[COLOR]: cssVar('fg2')},
      '.actions': {
        [PADDING]: rem(0.75, 0.5),
        [MARGIN]: 0,
        [DISPLAY]: FLEX,
        [BORDER + '-' + TOP]: cssVar(BORDER),
        [JUSTIFY_CONTENT]: 'space-between',
      },

      // tables
      table: {
        [MIN_WIDTH]: '100%',
        'border-collapse': 'collapse',
        'table-layout': FIXED,
      },

      thead: {[BACKGROUND]: cssVar('bg')},
      [`th,#${UNIQUE_ID} td`]: {
        [OVERFLOW]: HIDDEN,
        [PADDING]: rem(0.25, 0.5),
        [MAX_WIDTH]: rem(20),
        [BORDER]: cssVar(BORDER),
        'text-overflow': 'ellipsis',
        'white-space': NOWRAP,
        'border-width': px(1, 0, 0),
        [TEXT_ALIGN]: LEFT,
      },
      'th:first-child': {
        [WIDTH]: rem(3),
        [MIN_WIDTH]: rem(3),
        [MAX_WIDTH]: rem(3),
      },
      'th.sorted': {[BACKGROUND]: cssVar('bg3')},
      'td.extra': {[TEXT_ALIGN]: RIGHT},
      'tbody button': {
        [BACKGROUND]: NONE,
        [BORDER]: NONE,
        [FONT_SIZE]: 0,
        [WIDTH]: rem(0.8),
        [HEIGHT]: rem(0.8),
        [COLOR]: cssVar('fg2'),
        [MARGIN]: rem(0, 0.25, 0, -0.25),
        'line-height': rem(0.8),
      },
      'tbody button:first-letter': {[FONT_SIZE]: rem(0.8)},

      input: {
        [BACKGROUND]: cssVar('bg2'),
        [COLOR]: UNSET,
        [PADDING]: px(4),
        [BORDER]: 0,
        [MARGIN]: px(-4, 0),
        [FONT_SIZE]: UNSET,
        [MAX_WIDTH]: rem(6),
      },
      'input:focus': {'outline-width': 0},
      'input[type="number"]': {[WIDTH]: rem(3)},
      'input[type="checkbox"]': {[VERTICAL_ALIGN]: px(-2)},

      '.editableCell': {[DISPLAY]: 'inline-block', [MARGIN_RIGHT]: px(2)},

      'button.next': {[MARGIN_RIGHT]: rem(0.5)},

      'img.edit': EDIT_SVG,
      'img.done': DONE_SVG,
      'img.add': ADD_SVG,
      'img.clone': CLONE_SVG,
      'img.delete': DELETE_SVG,
      'img.ok': OK_SVG,
      'img.okDis': OK_SVG_DISABLED,
      'img.cancel': CANCEL_SVG,

      'span.warn': {[MARGIN]: rem(2, 0.25), [COLOR]: '#d81b60'},
    } as {[selector: string]: {[property: string]: string | number}},
    (style, selector) =>
      `#${UNIQUE_ID} ${selector}{${arrayJoin(
        objToArray(style, (value, property) => `${property}:${value};`),
      )}}`,
  ),
);
