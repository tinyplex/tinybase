import {arrayEvery, arrayFilter, arrayIndexOf} from '../common/array.ts';
import {isCellOrValueSchemaType} from '../common/cell.ts';

export const getTypeOrTypeUnion = (
  types: any[],
): string | string[] | undefined => {
  if (!arrayEvery(types, isCellOrValueSchemaType)) {
    return;
  }
  const uniqueTypes = arrayFilter(
    types,
    (type, index) => arrayIndexOf(types, type) == index,
  );
  return uniqueTypes[1] ? uniqueTypes : uniqueTypes[0];
};
