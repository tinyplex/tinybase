import type {Id} from '../@types/common/index.d.ts';
import type {
  Middleware,
  WillApplyChangesCallback,
  WillDelCellCallback,
  WillDelRowCallback,
  WillDelTableCallback,
  WillDelTablesCallback,
  WillDelValueCallback,
  WillDelValuesCallback,
  WillSetCellCallback,
  WillSetContentCallback,
  WillSetRowCallback,
  WillSetTableCallback,
  WillSetTablesCallback,
  WillSetValueCallback,
  WillSetValuesCallback,
  createMiddleware as createMiddlewareDecl,
} from '../@types/middleware/index.d.ts';
import type {
  Cell,
  CellOrUndefined,
  Changes,
  Content,
  Row,
  Store,
  Table,
  Tables,
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
    const willSetContentCallbacks: WillSetContentCallback[] = [];
    const willSetTablesCallbacks: WillSetTablesCallback[] = [];
    const willSetTableCallbacks: WillSetTableCallback[] = [];
    const willSetRowCallbacks: WillSetRowCallback[] = [];
    const willSetCellCallbacks: WillSetCellCallback[] = [];
    const willSetValuesCallbacks: WillSetValuesCallback[] = [];
    const willSetValueCallbacks: WillSetValueCallback[] = [];
    const willDelTablesCallbacks: WillDelTablesCallback[] = [];
    const willDelTableCallbacks: WillDelTableCallback[] = [];
    const willDelRowCallbacks: WillDelRowCallback[] = [];
    const willDelCellCallbacks: WillDelCellCallback[] = [];
    const willDelValuesCallbacks: WillDelValuesCallback[] = [];
    const willDelValueCallbacks: WillDelValueCallback[] = [];
    const willApplyChangesCallbacks: WillApplyChangesCallback[] = [];

    const willSetContent = (
      content: Content,
    ): Content | undefined =>
      arrayReduce(
        willSetContentCallbacks,
        (current, callback) =>
          isUndefined(current)
            ? current
            : callback(current as Content),
        content as Content | undefined,
      );

    const willSetTables = (tables: Tables): Tables | undefined =>
      arrayReduce(
        willSetTablesCallbacks,
        (current, callback) =>
          isUndefined(current) ? current : callback(current as Tables),
        tables as Tables | undefined,
      );

    const willSetTable = (tableId: Id, table: Table): Table | undefined =>
      arrayReduce(
        willSetTableCallbacks,
        (current, callback) =>
          isUndefined(current) ? current : callback(tableId, current as Table),
        table as Table | undefined,
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

    const willSetValues = (values: Values): Values | undefined =>
      arrayReduce(
        willSetValuesCallbacks,
        (current, callback) =>
          isUndefined(current) ? current : callback(current as Values),
        values as Values | undefined,
      );

    const willSetValue = (valueId: Id, value: Value): ValueOrUndefined =>
      arrayReduce(
        willSetValueCallbacks,
        (current, callback) =>
          isUndefined(current) ? current : callback(valueId, current as Value),
        value as ValueOrUndefined,
      );

    const willDelTables = (): boolean =>
      arrayEvery(willDelTablesCallbacks, (callback) => callback());

    const willDelTable = (tableId: Id): boolean =>
      arrayEvery(willDelTableCallbacks, (callback) => callback(tableId));

    const willDelRow = (tableId: Id, rowId: Id): boolean =>
      arrayEvery(willDelRowCallbacks, (callback) => callback(tableId, rowId));

    const willDelCell = (tableId: Id, rowId: Id, cellId: Id): boolean =>
      arrayEvery(willDelCellCallbacks, (callback) =>
        callback(tableId, rowId, cellId),
      );

    const willDelValues = (): boolean =>
      arrayEvery(willDelValuesCallbacks, (callback) => callback());

    const willDelValue = (valueId: Id): boolean =>
      arrayEvery(willDelValueCallbacks, (callback) => callback(valueId));

    const willApplyChanges = (
      changes: Changes,
    ): Changes | undefined =>
      arrayReduce(
        willApplyChangesCallbacks,
        (current, callback) =>
          isUndefined(current)
            ? current
            : callback(current as Changes),
        changes as Changes | undefined,
      );

    (store as any).setWillCallbacks(
      willSetContent,
      willSetTables,
      willSetTable,
      willSetRow,
      willSetCell,
      willSetValues,
      willSetValue,
      willDelTables,
      willDelTable,
      willDelRow,
      willDelCell,
      willDelValues,
      willDelValue,
      willApplyChanges,
    );

    const getStore = (): Store => store;

    const fluent = (actions: () => void): Middleware => {
      actions();
      return middleware;
    };

    const addWillSetContentCallback = (
      callback: WillSetContentCallback,
    ): Middleware =>
      fluent(() => arrayPush(willSetContentCallbacks, callback));

    const addWillSetTablesCallback = (
      callback: WillSetTablesCallback,
    ): Middleware => fluent(() => arrayPush(willSetTablesCallbacks, callback));

    const addWillSetTableCallback = (
      callback: WillSetTableCallback,
    ): Middleware => fluent(() => arrayPush(willSetTableCallbacks, callback));

    const addWillSetRowCallback = (callback: WillSetRowCallback): Middleware =>
      fluent(() => arrayPush(willSetRowCallbacks, callback));

    const addWillSetCellCallback = (
      callback: WillSetCellCallback,
    ): Middleware => fluent(() => arrayPush(willSetCellCallbacks, callback));

    const addWillSetValuesCallback = (
      callback: WillSetValuesCallback,
    ): Middleware => fluent(() => arrayPush(willSetValuesCallbacks, callback));

    const addWillSetValueCallback = (
      callback: WillSetValueCallback,
    ): Middleware => fluent(() => arrayPush(willSetValueCallbacks, callback));

    const addWillDelTablesCallback = (
      callback: WillDelTablesCallback,
    ): Middleware => fluent(() => arrayPush(willDelTablesCallbacks, callback));

    const addWillDelTableCallback = (
      callback: WillDelTableCallback,
    ): Middleware => fluent(() => arrayPush(willDelTableCallbacks, callback));

    const addWillDelRowCallback = (callback: WillDelRowCallback): Middleware =>
      fluent(() => arrayPush(willDelRowCallbacks, callback));

    const addWillDelCellCallback = (
      callback: WillDelCellCallback,
    ): Middleware => fluent(() => arrayPush(willDelCellCallbacks, callback));

    const addWillDelValuesCallback = (
      callback: WillDelValuesCallback,
    ): Middleware => fluent(() => arrayPush(willDelValuesCallbacks, callback));

    const addWillDelValueCallback = (
      callback: WillDelValueCallback,
    ): Middleware => fluent(() => arrayPush(willDelValueCallbacks, callback));

    const addWillApplyChangesCallback = (
      callback: WillApplyChangesCallback,
    ): Middleware =>
      fluent(() => arrayPush(willApplyChangesCallbacks, callback));

    const destroy = (): void => {};

    const middleware: Middleware = objFreeze({
      getStore,
      addWillSetContentCallback,
      addWillSetTablesCallback,
      addWillSetTableCallback,
      addWillSetRowCallback,
      addWillSetCellCallback,
      addWillSetValuesCallback,
      addWillSetValueCallback,
      addWillDelTablesCallback,
      addWillDelTableCallback,
      addWillDelRowCallback,
      addWillDelCellCallback,
      addWillDelValuesCallback,
      addWillDelValueCallback,
      addWillApplyChangesCallback,
      destroy,
    } as Middleware);

    return middleware;
  },
) as typeof createMiddlewareDecl;
