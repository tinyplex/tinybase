import {NUMBER, getTypeOf} from '../common/strings';
import {isFiniteNumber, isTypeStringOrBoolean} from '../common/other';
import {Cell} from '../store.d';

export const getCellType = (cell: Cell | undefined): string | undefined => {
  const type = getTypeOf(cell);
  return isTypeStringOrBoolean(type) ||
    (type == NUMBER && isFiniteNumber(cell as any))
    ? type
    : undefined;
};
