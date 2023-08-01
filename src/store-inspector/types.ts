import {Store} from '../types/store';

export type Position = 0 | 1 | 2 | 3;
export type StoreProp = {readonly store: Store};
export type Style = {[name: string]: number | string};
