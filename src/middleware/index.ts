import type {Id} from '../@types/common/index.d.ts';
import type {
  Middleware,
  WillDelCellCallback,
  WillDelValueCallback,
  WillSetCellCallback,
  WillSetValueCallback,
  createMiddleware as createMiddlewareDecl,
} from '../@types/middleware/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
  Store,
  Value,
  ValueOrUndefined,
} from '../@types/store/index.d.ts';
import {arrayEvery, arrayPush, arrayReduce} from '../common/array.ts';
import {getCreateFunction} from '../common/definable.ts';
import {objFreeze} from '../common/obj.ts';
import {isUndefined} from '../common/other.ts';

export const createMiddleware = getCreateFunction(
  (store: Store): Middleware => {
    const willSetCellCallbacks: WillSetCellCallback[] = [];
    const willSetValueCallbacks: WillSetValueCallback[] = [];
    const willDelCellCallbacks: WillDelCellCallback[] = [];
    const willDelValueCallbacks: WillDelValueCallback[] = [];

    const willSetCell = (
      tableId: Id,
      rowId: Id,
      cellId: Id,
      cell: Cell,
    ): CellOrUndefined =>
      arrayReduce(
        willSetCellCallbacks,
        (current, callback) =>
          isUndefined(current)
            ? current
            : callback(tableId, rowId, cellId, current as Cell),
        cell as CellOrUndefined,
      );

    const willSetValue = (valueId: Id, value: Value): ValueOrUndefined =>
      arrayReduce(
        willSetValueCallbacks,
        (current, callback) =>
          isUndefined(current) ? current : callback(valueId, current as Value),
        value as ValueOrUndefined,
      );

    const willDelCell = (tableId: Id, rowId: Id, cellId: Id): boolean =>
      arrayEvery(willDelCellCallbacks, (callback) =>
        callback(tableId, rowId, cellId),
      );

    const willDelValue = (valueId: Id): boolean =>
      arrayEvery(willDelValueCallbacks, (callback) => callback(valueId));

    (store as any).setInternalWillSets(
      willSetCell,
      willSetValue,
      willDelCell,
      willDelValue,
    );

    const getStore = (): Store => store;

    const fluent = (actions: () => void): Middleware => {
      actions();
      return middleware;
    };

    const addWillSetCellCallback = (
      callback: WillSetCellCallback,
    ): Middleware => fluent(() => arrayPush(willSetCellCallbacks, callback));

    const addWillSetValueCallback = (
      callback: WillSetValueCallback,
    ): Middleware => fluent(() => arrayPush(willSetValueCallbacks, callback));

    const addWillDelCellCallback = (
      callback: WillDelCellCallback,
    ): Middleware => fluent(() => arrayPush(willDelCellCallbacks, callback));

    const addWillDelValueCallback = (
      callback: WillDelValueCallback,
    ): Middleware => fluent(() => arrayPush(willDelValueCallbacks, callback));

    const destroy = (): void => {};

    const middleware: Middleware = objFreeze({
      getStore,
      addWillSetCellCallback,
      addWillSetValueCallback,
      addWillDelCellCallback,
      addWillDelValueCallback,
      destroy,
    } as Middleware);

    return middleware;
  },
) as typeof createMiddlewareDecl;
