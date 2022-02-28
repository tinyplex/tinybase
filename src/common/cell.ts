import {Cell, CellOrUndefined, Store} from '../store.d';
import {NUMBER, getTypeOf} from '../common/strings';
import {
  isFiniteNumber,
  isTypeStringOrBoolean,
  isUndefined,
} from '../common/other';
import {Id} from '../common.d';

export const getCellType = (cell: Cell | undefined): string | undefined => {
  const type = getTypeOf(cell);
  return isTypeStringOrBoolean(type) ||
    (type == NUMBER && isFiniteNumber(cell as any))
    ? type
    : undefined;
};

export const setOrDelCell = (
  store: Store,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  cell: CellOrUndefined,
) =>
  isUndefined(cell)
    ? store.delCell(tableId, rowId, cellId, true)
    : store.setCell(tableId, rowId, cellId, cell);
