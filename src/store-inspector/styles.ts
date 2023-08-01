import {Position, Style} from './types';
import {objMerge} from '../common/obj';

const FIXED = {position: 'fixed'};
const PALETTE = {background: '#111d', color: '#fff'};
const FLEX = {display: 'flex'};
const PADDING = {padding: '0.25rem'};

const BUTTON_SQUARE = {width: '1rem', height: '1rem'};
const NUB_SQUARE = {width: '1.5rem', height: '1.5rem', padding: '0.25rem'};
const HORIZONTAL_PANEL = {width: '100vw', height: '30vh'};
const VERTICAL_PANEL = {width: '30vw', height: '100vh'};

const TOP_RIGHT = {top: 0, right: 0};
const BOTTOM_RIGHT = {bottom: 0, right: 0};
const BOTTOM_LEFT = {bottom: 0, left: 0};

export const getAppStyle = (): Style => objMerge({all: 'initial'}, FIXED);

export const getNubStyle = (position: Position): Style =>
  objMerge(
    FIXED,
    PALETTE,
    [TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT][position],
    NUB_SQUARE,
    {cursor: 'zoom-in'},
  );

export const getButtonStyle = (style: Style = {}): Style =>
  objMerge(BUTTON_SQUARE, style);

export const getPanelStyle = (position: Position): Style =>
  objMerge(
    FIXED,
    PALETTE,
    [TOP_RIGHT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_LEFT][position],
    [HORIZONTAL_PANEL, VERTICAL_PANEL][position % 2],
    FLEX,
    {flexDirection: 'column'},
  );

export const getHeaderStyle = (): Style => objMerge(FLEX, PADDING);

export const getBodyStyle = (): Style => objMerge(PADDING);
