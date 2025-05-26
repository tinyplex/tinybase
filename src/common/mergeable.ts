import type {MergeableChanges} from '../@types/mergeables/index.d.ts';
import {objIsEmpty} from './obj.ts';
import {isArray} from './other.ts';

export const changesAreNotEmpty = (
  changes: MergeableChanges | void,
): changes is MergeableChanges =>
  isArray(changes) &&
  (!objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0]));
