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

const reduceCallbacks = (
  callbacks: ((...args: any[]) => any)[],
  thing: any,
  ...ids: Id[]
): any =>
  arrayReduce(
    callbacks,
    (current, callback) =>
      isUndefined(current) ? current : callback(...ids, current),
    thing,
  );

const everyCallback = (
  callbacks: ((...args: any[]) => boolean)[],
  ...ids: Id[]
): boolean => arrayEvery(callbacks, (callback) => callback(...ids));

export const createMiddleware = getCreateFunction(
  (store: Store): Middleware => {
    const fluent = (actions: () => void): Middleware => {
      actions();
      return middleware;
    };

    const addCallback =
      <Callback>(callbacks: Callback[]) =>
      (callback: Callback): Middleware =>
        fluent(() => arrayPush(callbacks, callback));

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

    const willSetContent = (content: Content): Content | undefined =>
      reduceCallbacks(willSetContentCallbacks, content);

    const willSetTables = (tables: Tables): Tables | undefined =>
      reduceCallbacks(willSetTablesCallbacks, tables);

    const willSetTable = (tableId: Id, table: Table): Table | undefined =>
      reduceCallbacks(willSetTableCallbacks, table, tableId);

    const willSetRow = (tableId: Id, rowId: Id, row: Row): Row | undefined =>
      reduceCallbacks(willSetRowCallbacks, row, tableId, rowId);

    const willSetCell = (
      tableId: Id,
      rowId: Id,
      cellId: Id,
      cell: Cell,
    ): CellOrUndefined =>
      reduceCallbacks(willSetCellCallbacks, cell, tableId, rowId, cellId);

    const willSetValues = (values: Values): Values | undefined =>
      reduceCallbacks(willSetValuesCallbacks, values);

    const willSetValue = (valueId: Id, value: Value): ValueOrUndefined =>
      reduceCallbacks(willSetValueCallbacks, value, valueId);

    const willDelTables = (): boolean => everyCallback(willDelTablesCallbacks);

    const willDelTable = (tableId: Id): boolean =>
      everyCallback(willDelTableCallbacks, tableId);

    const willDelRow = (tableId: Id, rowId: Id): boolean =>
      everyCallback(willDelRowCallbacks, tableId, rowId);

    const willDelCell = (tableId: Id, rowId: Id, cellId: Id): boolean =>
      everyCallback(willDelCellCallbacks, tableId, rowId, cellId);

    const willDelValues = (): boolean => everyCallback(willDelValuesCallbacks);

    const willDelValue = (valueId: Id): boolean =>
      everyCallback(willDelValueCallbacks, valueId);

    const willApplyChanges = (changes: Changes): Changes | undefined =>
      reduceCallbacks(willApplyChangesCallbacks, changes);

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

    const addWillSetContentCallback = addCallback(willSetContentCallbacks);
    const addWillSetTablesCallback = addCallback(willSetTablesCallbacks);
    const addWillSetTableCallback = addCallback(willSetTableCallbacks);
    const addWillSetRowCallback = addCallback(willSetRowCallbacks);
    const addWillSetCellCallback = addCallback(willSetCellCallbacks);
    const addWillSetValuesCallback = addCallback(willSetValuesCallbacks);
    const addWillSetValueCallback = addCallback(willSetValueCallbacks);
    const addWillDelTablesCallback = addCallback(willDelTablesCallbacks);
    const addWillDelTableCallback = addCallback(willDelTableCallbacks);
    const addWillDelRowCallback = addCallback(willDelRowCallbacks);
    const addWillDelCellCallback = addCallback(willDelCellCallbacks);
    const addWillDelValuesCallback = addCallback(willDelValuesCallbacks);
    const addWillDelValueCallback = addCallback(willDelValueCallbacks);
    const addWillApplyChangesCallback = addCallback(willApplyChangesCallbacks);

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
