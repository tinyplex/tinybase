import type {Id} from '../@types/common/index.d.ts';
import type {
  Middleware,
  WillDelCellCallback,
  WillDelRowCallback,
  WillDelValueCallback,
  WillDelValuesCallback,
  WillSetCellCallback,
  WillSetRowCallback,
  WillSetTableCallback,
  WillSetValueCallback,
  WillSetValuesCallback,
  createMiddleware as createMiddlewareDecl,
} from '../@types/middleware/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
  Row,
  Store,
  Table,
  Value,
  ValueOrUndefined,
  Values,
} from '../@types/store/index.d.ts';
import {arrayEvery, arrayPush, arrayReduce} from '../common/array.ts';
import {getCreateFunction} from '../common/definable.ts';
import {objFreeze} from '../common/obj.ts';
import {isUndefined} from '../common/other.ts';

export const createMiddleware = getCreateFunction(
  (store: Store): Middleware => {
    const willSetCellCallbacks: WillSetCellCallback[] = [];
    const willSetTableCallbacks: WillSetTableCallback[] = [];
    const willSetRowCallbacks: WillSetRowCallback[] = [];
    const willSetValueCallbacks: WillSetValueCallback[] = [];
    const willSetValuesCallbacks: WillSetValuesCallback[] = [];
    const willDelCellCallbacks: WillDelCellCallback[] = [];
    const willDelRowCallbacks: WillDelRowCallback[] = [];
    const willDelValueCallbacks: WillDelValueCallback[] = [];
    const willDelValuesCallbacks: WillDelValuesCallback[] = [];

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

    const willSetRow = (tableId: Id, rowId: Id, row: Row): Row | undefined =>
      arrayReduce(
        willSetRowCallbacks,
        (current, callback) =>
          isUndefined(current)
            ? current
            : callback(tableId, rowId, current as Row),
        row as Row | undefined,
      );

    const willSetTable = (
      tableId: Id,
      table: Table,
    ): Table | undefined =>
      arrayReduce(
        willSetTableCallbacks,
        (current, callback) =>
          isUndefined(current)
            ? current
            : callback(tableId, current as Table),
        table as Table | undefined,
      );

    const willSetValue = (valueId: Id, value: Value): ValueOrUndefined =>
      arrayReduce(
        willSetValueCallbacks,
        (current, callback) =>
          isUndefined(current) ? current : callback(valueId, current as Value),
        value as ValueOrUndefined,
      );

    const willSetValues = (values: Values): Values | undefined =>
      arrayReduce(
        willSetValuesCallbacks,
        (current, callback) =>
          isUndefined(current) ? current : callback(current as Values),
        values as Values | undefined,
      );

    const willDelCell = (tableId: Id, rowId: Id, cellId: Id): boolean =>
      arrayEvery(willDelCellCallbacks, (callback) =>
        callback(tableId, rowId, cellId),
      );

    const willDelRow = (tableId: Id, rowId: Id): boolean =>
      arrayEvery(willDelRowCallbacks, (callback) => callback(tableId, rowId));

    const willDelValue = (valueId: Id): boolean =>
      arrayEvery(willDelValueCallbacks, (callback) => callback(valueId));

    const willDelValues = (): boolean =>
      arrayEvery(willDelValuesCallbacks, (callback) => callback());

    (store as any).setInternalWillSets(
      willSetCell,
      willSetValue,
      willDelCell,
      willDelValue,
      willSetRow,
      willSetValues,
      willDelRow,
      willDelValues,
      willSetTable,
    );

    const getStore = (): Store => store;

    const fluent = (actions: () => void): Middleware => {
      actions();
      return middleware;
    };

    const addWillSetCellCallback = (
      callback: WillSetCellCallback,
    ): Middleware => fluent(() => arrayPush(willSetCellCallbacks, callback));

    const addWillSetRowCallback = (callback: WillSetRowCallback): Middleware =>
      fluent(() => arrayPush(willSetRowCallbacks, callback));

    const addWillSetTableCallback = (
      callback: WillSetTableCallback,
    ): Middleware =>
      fluent(() => arrayPush(willSetTableCallbacks, callback));

    const addWillSetValueCallback = (
      callback: WillSetValueCallback,
    ): Middleware => fluent(() => arrayPush(willSetValueCallbacks, callback));

    const addWillSetValuesCallback = (
      callback: WillSetValuesCallback,
    ): Middleware => fluent(() => arrayPush(willSetValuesCallbacks, callback));

    const addWillDelCellCallback = (
      callback: WillDelCellCallback,
    ): Middleware => fluent(() => arrayPush(willDelCellCallbacks, callback));

    const addWillDelRowCallback = (callback: WillDelRowCallback): Middleware =>
      fluent(() => arrayPush(willDelRowCallbacks, callback));

    const addWillDelValueCallback = (
      callback: WillDelValueCallback,
    ): Middleware => fluent(() => arrayPush(willDelValueCallbacks, callback));

    const addWillDelValuesCallback = (
      callback: WillDelValuesCallback,
    ): Middleware =>
      fluent(() => arrayPush(willDelValuesCallbacks, callback));

    const destroy = (): void => {};

    const middleware: Middleware = objFreeze({
      getStore,
      addWillSetCellCallback,
      addWillSetTableCallback,
      addWillSetRowCallback,
      addWillSetValueCallback,
      addWillSetValuesCallback,
      addWillDelCellCallback,
      addWillDelRowCallback,
      addWillDelValueCallback,
      addWillDelValuesCallback,
      destroy,
    } as Middleware);

    return middleware;
  },
) as typeof createMiddlewareDecl;
