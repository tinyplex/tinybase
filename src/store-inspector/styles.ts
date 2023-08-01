import {Position} from './types';
import {objMerge} from '../common/obj';

const FIXED = {position: 'fixed'};
const PALETTE = {background: 'black', color: 'white'};

const HORIZONTAL_PANEL = {width: '100vw', height: '30vh'};
const VERTICAL_PANEL = {width: '30vw', height: '100vh'};

const TOP_RIGHT = {top: 0, right: 0};
const BOTTOM_RIGHT = {bottom: 0, right: 0};
const BOTTOM_LEFT = {bottom: 0, left: 0};

export const getAppStyle = () => objMerge({all: 'initial'}, FIXED);

export const getNubStyle = (position: Position) =>
  objMerge(
    FIXED,
    PALETTE,
    [TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT][position],
    {width: '1rem', height: '1rem'},
  );

export const getPanelStyle = (position: Position) =>
  objMerge(
    FIXED,
    PALETTE,
    [TOP_RIGHT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_LEFT][position],
    [HORIZONTAL_PANEL, VERTICAL_PANEL][position % 2],
  );
