import {Position, Style} from './types';
import {objMerge} from '../common/obj';

const FIXED = {position: 'fixed'};
const PALETTE = {background: '#111d', color: '#fff'};
const FLEX = {display: 'flex'};
const PADDING = {padding: '0.25rem'};

const BUTTON_STYLE = {width: '1rem', height: '1rem'};
const NUB_SQUARE = {width: '1.5rem', height: '1.5rem', padding: '0.25rem'};
const HORIZONTAL_PANEL = {width: '100vw', height: '30vh'};
const VERTICAL_PANEL = {width: '30vw', height: '100vh'};

const TOP_RIGHT = {top: 0, right: 0};
const BOTTOM_RIGHT = {bottom: 0, right: 0};
const BOTTOM_LEFT = {bottom: 0, left: 0};

export const APP_STYLE: Style = objMerge(
  {all: 'initial', fontFamily: 'arial,sans-serif', fontSize: '0.75rem'},
  FIXED,
);
export const HEADER_STYLE: Style = objMerge(FLEX, PADDING, {
  background: '#000',
  alignItems: 'center',
});
export const TITLE_STYLE: Style = objMerge({
  flex: 1,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  marginLeft: '0.25rem',
});
export const BODY_STYLE: Style = objMerge(PADDING, {overflow: 'auto'});

export const getNubStyle = (position: Position): Style =>
  objMerge(
    FIXED,
    PALETTE,
    NUB_SQUARE,
    [TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT][position],
  );

export const getButtonStyle = (style: Style = {}): Style =>
  objMerge(BUTTON_STYLE, style);

export const getPanelStyle = (position: Position): Style =>
  objMerge(
    FIXED,
    PALETTE,
    FLEX,
    {flexDirection: 'column'},
    [TOP_RIGHT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_LEFT][position],
    [HORIZONTAL_PANEL, VERTICAL_PANEL][position % 2],
  );
