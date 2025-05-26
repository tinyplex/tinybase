import type {
  MergeableChanges,
  MergeableContent,
} from '../@types/mergeables/index.d.ts';
import {isCellOrValueOrNullOrUndefined} from './cell.ts';
import {objIsEmpty, objValidate} from './obj.ts';
import {isArray, size} from './other.ts';
import {stampValidate} from './stamps.ts';

export const changesAreNotEmpty = (
  changes: MergeableChanges | void,
): changes is MergeableChanges =>
  isArray(changes) &&
  (!objIsEmpty(changes[0][0]) || !objIsEmpty(changes[1][0]));

export const validateMergeableContent = (
  mergeableContent: MergeableContent,
): boolean =>
  isArray(mergeableContent) &&
  size(mergeableContent) == 2 &&
  stampValidate(mergeableContent[0], (tableStamps) =>
    objValidate(
      tableStamps,
      (tableStamp) =>
        stampValidate(tableStamp, (rowStamps) =>
          objValidate(
            rowStamps,
            (rowStamp) =>
              stampValidate(rowStamp, (cellStamps) =>
                objValidate(
                  cellStamps,
                  (cellStamp) =>
                    stampValidate(cellStamp, isCellOrValueOrNullOrUndefined),
                  undefined,
                  1,
                ),
              ),
            undefined,
            1,
          ),
        ),
      undefined,
      1,
    ),
  ) &&
  stampValidate(mergeableContent[1], (values) =>
    objValidate(
      values,
      (value) => stampValidate(value, isCellOrValueOrNullOrUndefined),
      undefined,
      1,
    ),
  );
