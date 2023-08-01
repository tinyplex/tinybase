import {CLOSE_SVG, LOGO_SVG, POSITIONS_SVG} from './svg';
/* eslint-disable max-len */
import {Position, Style} from './types';
import {objMap, objMerge} from '../common/obj';
import {UNIQUE_ID} from './common';
import {arrayJoin} from '../common/array';

const HORIZONTAL_PANEL = {width: '100vw', height: '30vh'};
const VERTICAL_PANEL = {width: '30vw', height: '100vh'};

export const TOP_RIGHT = {top: 0, right: 0};
export const BOTTOM_RIGHT = {bottom: 0, right: 0};
export const BOTTOM_LEFT = {bottom: 0, left: 0};

export const APP_STYLESHEET = arrayJoin(
  objMap(
    {
      '': 'all:initial;font-family:sans-serif;font-size:0.75rem;position:fixed',
      '*': 'all:revert',
      img: 'width:1rem;height:1rem;background:#111;border:0',
      '>img': `position:fixed;width:1.5rem;height:1.5rem;padding:0.25rem;${LOGO_SVG}`, // Nub
      main: 'position:fixed;display:flex;flex-direction:column;background:#111d;color:#fff', // Panel
      header: 'display:flex;padding:0.25rem;background:#000;align-items:center', // Header
      'header>img:nth-of-type(1)': LOGO_SVG,
      'header>img[data-id="0"]': POSITIONS_SVG[0],
      'header>img[data-id="1"]': POSITIONS_SVG[1],
      'header>img[data-id="2"]': POSITIONS_SVG[2],
      'header>img[data-id="3"]': POSITIONS_SVG[3],
      'header>img:nth-of-type(5)': CLOSE_SVG,
      'header>span':
        'flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;margin-left:0.25rem',
      article: 'padding:0.25rem;overflow:auto', // Body
    },
    (style, selector) => `#${UNIQUE_ID} ${selector}{${style}}`,
  ),
);

export const getPanelStyle = (position: Position): Style =>
  objMerge(
    [TOP_RIGHT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_LEFT][position],
    [HORIZONTAL_PANEL, VERTICAL_PANEL][position % 2],
  );
