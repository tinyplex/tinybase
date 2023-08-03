import {OPEN_VALUE, POSITION_VALUE} from './common';
import {Position} from './types';
import {Store} from '../types/store';
import {useValue} from '../ui-react';

export const usePosition = (store: Store): Position =>
  (useValue(POSITION_VALUE, store) as any) ?? 1;

export const useOpen = (store: Store) =>
  (useValue(OPEN_VALUE, store) as boolean) ?? false;
