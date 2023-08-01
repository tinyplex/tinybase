import {Position} from './types';
import {Store} from '../types/store';
import {useValue} from '../ui-react';

export const usePosition = (store: Store): Position =>
  (useValue('position', store) as any) ?? 1;

export const useOpen = (store: Store) =>
  (useValue('open', store) as boolean) ?? false;
