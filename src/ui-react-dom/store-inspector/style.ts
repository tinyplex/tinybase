/* eslint-disable max-len */
import {CLOSE_SVG, DONE_SVG, EDIT_SVG, LOGO_SVG, POSITIONS_SVG} from './svg';
import {arrayJoin, arrayMap} from '../../common/array';
import {objNew, objToArray} from '../../common/obj';
import {UNIQUE_ID} from './common';

const SCROLLBAR = '*::-webkit-scrollbar';

export const APP_STYLESHEET = arrayJoin(
  objToArray(
    {
      '': 'all:initial;font-family:sans-serif;font-size:0.75rem;position:fixed;z-index:999999',
      '*': 'all:revert',
      '*::before': 'all:revert',
      '*::after': 'all:revert',
      [SCROLLBAR]: 'width:0.5rem;height:0.5rem;',
      [SCROLLBAR + '-track']: 'background:#111',
      [SCROLLBAR + '-thumb']: 'background:#999;border:1px solid #111',
      [SCROLLBAR + '-thumb:hover']: 'background:#fff',
      [SCROLLBAR + '-corner']: 'background:#111',
      img: 'width:1rem;height:1rem;background:#111;border:0;vertical-align:text-bottom',

      // Nub
      '>img': 'padding:0.25rem;bottom:0;right:0;position:fixed;' + LOGO_SVG,
      ...objNew(
        arrayMap(['bottom:0;left:0', 'top:0;right:0'], (css, p) => [
          `>img[data-position='${p}']`,
          css,
        ]),
      ),

      // Panel
      main: 'display:flex;flex-direction:column;background:#111d;color:#fff;position:fixed;',
      ...objNew(
        arrayMap(
          [
            'bottom:0;left:0;width:35vw;height:100vh',
            'top:0;right:0;width:100vw;height:30vh',
            'bottom:0;left:0;width:100vw;height:30vh',
            'top:0;right:0;width:35vw;height:100vh',
            'top:0;right:0;width:100vw;height:100vh',
          ],
          (css, p) => [`main[data-position='${p}']`, css],
        ),
      ),

      // Header
      header: 'display:flex;padding:0.25rem;background:#000;align-items:center',
      'header>img:nth-of-type(1)': LOGO_SVG,
      'header>img:nth-of-type(6)': CLOSE_SVG,
      ...objNew(
        arrayMap(POSITIONS_SVG, (SVG, p) => [
          `header>img[data-id='${p}']`,
          SVG,
        ]),
      ),
      'header>span':
        'flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;margin-left:0.25rem',

      // Body
      article: 'padding:0.25rem 0.25rem 0.25rem 0.5rem;overflow:auto;flex:1',
      details: 'margin-left:0.75rem;width:fit-content;',
      'details img': 'display:none',
      'details[open]>summary img':
        'display:unset;background:none;margin-left:0.25rem',
      'details[open]>summary img.edit': EDIT_SVG,
      'details[open]>summary img.done': DONE_SVG,
      summary:
        'margin-left:-0.75rem;line-height:1.25rem;user-select:none;width:fit-content',

      // tables
      table: 'border-collapse:collapse;table-layout:fixed;margin-bottom:0.5rem',
      'table input':
        'background:#111;color:unset;padding:0 0.25rem;border:0;font-size:unset;vertical-align:top;margin:0',
      'table input[type="number"]': 'width:4rem',
      'table tbody button':
        'font-size:0;background:#fff;border-radius:50%;margin:0 0.125rem 0 0;width:0.85rem;color:#111',
      'table button:first-letter': 'font-size:0.75rem',
      thead: 'background:#222',
      'th:nth-of-type(1)': 'min-width:2rem;',
      'th.sorted': 'background:#000',
      'table caption': 'text-align:left;white-space:nowrap;line-height:1.25rem',
      button: 'width:1.5rem;border:none;background:none;color:#fff;padding:0',
      'button[disabled]': 'color:#777',
      'button.next': 'margin-right:0.5rem',
      [`th,#${UNIQUE_ID} td`]:
        'overflow:hidden;text-overflow:ellipsis;padding:0.25rem 0.5rem;max-width:12rem;white-space:nowrap;border-width:1px 0;border-style:solid;border-color:#777;text-align:left',

      'span.warn': 'margin:0.25rem;color:#d81b60',
    },
    (style, selector) => (style ? `#${UNIQUE_ID} ${selector}{${style}}` : ''),
  ),
);
