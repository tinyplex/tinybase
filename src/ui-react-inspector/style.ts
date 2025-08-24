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

export const APP_STYLESHEET = arrayJoin(
  objToArray(
    {
      '': {
        all: 'initial',
        'font-family': 'inter,sans-serif',
        'font-size': '.75rem',
        position: 'fixed',
        'z-index': 999999,
        '--background': 'oklch(20% .01 var(--hue))',
        '--background2': 'oklch(15% .01 var(--hue))',
        '--background3': 'oklch(25% .01 var(--hue))',
        '--background4': 'oklch(30% .01 var(--hue))',
        '--foreground': 'oklch(85% .01 var(--hue))',
        '--foreground2': 'oklch(60% .01 var(--hue))',
        '--border': '1px solid var(--background4)',
      },
      '*': {all: 'revert'},
      '*::before': {all: 'revert'},
      '*::after': {all: 'revert'},

      [SCROLLBAR]: {width: '.5rem', height: '.5rem'},
      [SCROLLBAR + '-thumb']: {background: 'var(--background4)'},
      [SCROLLBAR + '-thumb:hover']: {background: 'var(--background4)'},
      [SCROLLBAR + '-corner']: {background: 'none'},
      [SCROLLBAR + '-track']: {background: 'none'},

      img: {
        width: '.8rem',
        height: '.8rem',
        'vertical-align': 'text-bottom',
        cursor: 'pointer',
        margin: '-2.5px 2px -2.5px 0',
        padding: '2px',
        border: 'var(--border)',
        background: 'var(--background3)',
        'box-shadow': '0 1px 2px 0 #0007',
        'border-radius': '.25rem',
      },
      'img.flat': {border: 'none', background: 'none', 'box-shadow': 'none'},

      // Nub
      '>img': {
        padding: '.25rem',
        bottom: '0',
        right: '0',
        position: 'fixed',
        height: 'unset',
        margin: '0',
        ...LOGO_SVG,
      },
      ...objNew(
        arrayMap(
          [
            {bottom: 0, left: 0},
            {top: 0, right: 0},
          ],
          (css, p) => [`>img[data-position='${p}']`, css],
        ),
      ),

      // Panel
      main: {
        display: 'flex',
        'flex-direction': 'column',
        color: 'var(--foreground)',
        background: 'var(--background)',
        overflow: 'hidden',
        position: 'fixed',
        'box-shadow': '0 1px 2px 0 #0007',
      },
      ...objNew(
        arrayMap(
          [
            {
              bottom: 0,
              left: 0,
              width: '35vw',
              height: '100vh',
              'border-right': 'var(--border)',
            },
            {
              top: 0,
              right: 0,
              width: '100vw',
              height: '30vh',
              'border-bottom': 'var(--border)',
            },
            {
              bottom: 0,
              left: 0,
              width: '100vw',
              height: '30vh',
              'border-top': 'var(--border)',
            },
            {
              top: 0,
              right: 0,
              width: '35vw',
              height: '100vh',
              'border-left': 'var(--border)',
            },
            {top: 0, right: 0, width: '100vw', height: '100vh'},
          ],
          (css, p) => [`main[data-position='${p}']`, css],
        ),
      ),

      // Header
      header: {
        display: 'flex',
        padding: '.5rem',
        'align-items': 'center',
        'box-shadow': '0 1px 4px 0 #000',
        'border-bottom': 'var(--border)',
        background: 'oklch(30% 0.008 var(--hue) / .5)',
        'backdrop-filter': 'blur(4px)',
        position: 'absolute',
        width: 'calc(100% - .5rem)',
      },
      'header>img:nth-of-type(1)': {height: '1rem', width: '1rem', ...LOGO_SVG},
      'header>img:nth-of-type(6)': CLOSE_SVG,
      ...objNew(
        arrayMap(POSITIONS_SVG, (SVG, p) => [
          `header>img[data-id='${p}']`,
          SVG,
        ]),
      ),
      'header>span': {
        'font-weight': 800,
        flex: 1,
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
      },

      // Body
      article: {'padding-top': '2rem', overflow: 'auto', flex: 1},

      details: {
        border: 'var(--border)',
        'border-radius': '.25rem',
        margin: '.5rem',
      },
      summary: {
        background: 'var(--background3)',
        'border-radius': '.25rem',
        'user-select': 'none',
        margin: '-1px',
        border: 'var(--border)',
        padding: '0.25rem 0.125rem',
        display: 'flex',
        'justify-content': 'space-between',
        'align-items': 'center',
      },
      'summary>span::before': {
        display: 'inline-block',
        'vertical-align': 'sub',
        margin: '2px',
        width: '1rem',
        height: '1rem',
        ...RIGHT_SVG,
      },
      'details[open]>summary': {
        'border-bottom-left-radius': 0,
        'border-bottom-right-radius': 0,
        'margin-bottom': 0,
      },
      'details[open]>summary>span::before': DOWN_SVG,
      'details>summary img': {display: 'none'},
      'details[open]>summary img': {display: 'unset', 'margin-left': '.25rem'},
      'details>div': {overflow: 'auto'},

      'img.edit': EDIT_SVG,
      'img.done': DONE_SVG,

      caption: {
        color: 'var(--foreground2)',
        'text-align': 'left',
        'white-space': 'nowrap',
        padding: '.25rem .5rem',
      },
      'caption button': {
        width: '1.5rem',
        border: 'none',
        background: 'none',
        color: 'var(--foreground)',
        padding: 0,
        cursor: 'pointer',
      },
      'caption button[disabled]': {color: 'var(--foreground2)'},
      '.actions': {
        padding: '.75rem .5rem',
        margin: 0,
        'border-top': 'var(--border)',
        display: 'flex',
        'justify-content': 'space-between',
      },

      // tables
      table: {
        'border-collapse': 'collapse',
        'table-layout': 'fixed',
        'min-width': '100%',
      },

      thead: {background: 'var(--background)'},
      [`th,#${UNIQUE_ID} td`]: {
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        padding: '.25rem .5rem',
        'max-width': '20rem',
        'white-space': 'nowrap',
        border: 'var(--border)',
        'border-width': '1px 0 0',
        'text-align': 'left',
      },
      'th:first-child': {
        width: '3rem',
        'min-width': '3rem',
        'max-width': '3rem',
      },
      'th.sorted': {background: 'var(--background3)'},
      'td.extra': {'text-align': 'right'},
      'tbody button': {
        background: 'none',
        border: 'none',
        'font-size': '0',
        width: '.8rem',
        height: '.8rem',
        'line-height': '.8rem',
        color: 'var(--foreground2)',
        margin: '0 .25rem 0 -.25rem',
      },
      'tbody button:first-letter': {'font-size': '.8rem'},

      input: {
        background: 'var(--background2)',
        color: 'unset',
        padding: '4px',
        border: 0,
        margin: '-4px 0',
        'font-size': 'unset',
        'max-width': '6rem',
      },
      'input:focus': {'outline-width': '0'},
      'input[type="number"]': {width: '3rem'},
      'input[type="checkbox"]': {'vertical-align': '-2px'},

      '.editableCell': {display: 'inline-block', 'margin-right': '2px'},

      'button.next': {'margin-right': '.5rem'},
      'img.add': ADD_SVG,
      'img.clone': CLONE_SVG,
      'img.delete': DELETE_SVG,
      'img.ok': OK_SVG,
      'img.okDis': OK_SVG_DISABLED,
      'img.cancel': CANCEL_SVG,

      'span.warn': {margin: '2rem .25rem', color: '#d81b60'},
    } as {[selector: string]: {[property: string]: string | number}},
    (style, selector) =>
      `#${UNIQUE_ID} ${selector}{${arrayJoin(
        objToArray(style, (value, property) => `${property}:${value};`),
      )}}`,
  ),
);
