import {Doc as YDoc, type YEvent, Map as YMap} from 'yjs';
import type {Id} from '../../@types/common/index.d.ts';
import type {PersisterListener} from '../../@types/persisters/index.d.ts';
import type {
  YjsPersister,
  createYjsPersister as createYjsPersisterDecl,
} from '../../@types/persisters/persister-yjs/index.d.ts';
import type {
  Cell,
  Changes,
  Content,
  Store,
  Table,
  Tables,
  Value,
} from '../../@types/store/index.d.ts';
import {arrayForEach} from '../../common/array.ts';
import {ERROR_CONTENT, errorThrow, tryCatch} from '../../common/error.ts';
import {mapForEach} from '../../common/map.ts';
import {
  IdObj,
  objEnsure,
  objForEach,
  objHas,
  objNew,
  objSet,
} from '../../common/obj.ts';
import {
  ifNotUndefined,
  isEmpty,
  isUndefined,
  size,
} from '../../common/other.ts';
import {T, TINYBASE, V} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';

type Observer = (events: YEvent<any>[]) => void;

const DELETE = 'delete';

const getYMap = <Value>(yMap: unknown): YMap<Value> =>
  yMap instanceof YMap ? yMap : errorThrow(ERROR_CONTENT);

const getYContent = (
  yContent: YMap<any>,
): [YMap<YMap<YMap<Cell>>>, YMap<Value>] => [
  getYMap(yContent.get(T)),
  getYMap(yContent.get(V)),
];

const yMapToObj = <From, To = From>(
  yMap: YMap<From>,
  mapper?: (value: From) => To,
): IdObj<To> => {
  const obj = objNew<To>();
  getYMap<From>(yMap).forEach((value, id) =>
    objSet(obj, id, mapper ? mapper(value) : (value as any as To)),
  );
  return obj;
};

const yTablesToObj = (yTables: YMap<YMap<YMap<Cell>>>): Tables =>
  yMapToObj(yTables, (yTable) => yMapToObj(yTable, (yRow) => yMapToObj(yRow)));

const getYContentAsContent = (yContent: YMap<any>): Content => {
  const [yTables, yValues] = getYContent(yContent);
  return [yTablesToObj(yTables), yMapToObj(yValues)];
};

const getChangesFromYDoc = (
  yContent: YMap<any>,
  events: YEvent<any>[],
): Changes => {
  if (size(events) == 1 && isEmpty(events[0].path)) {
    return [...getYContentAsContent(yContent), 1];
  }
  const [yTables, yValues] = getYContent(yContent);
  const tables = objNew<Table>();
  const values = objNew<Value>();
  arrayForEach(events, ({path, changes: {keys}}) =>
    path[0] == T
      ? ifNotUndefined(
          path[1] as string,
          (yTableId) => {
            const table = objEnsure(tables, yTableId, objNew) as any;
            const yTable = getYMap<YMap<Cell>>(yTables.get(yTableId));
            ifNotUndefined(
              path[2] as string,
              (yRowId) => {
                const row = objEnsure(table, yRowId, objNew) as any;
                const yRow = getYMap<Cell>(yTable.get(yRowId));
                mapForEach(keys, (cellId, {action}) =>
                  objSet(
                    row,
                    cellId,
                    action == DELETE ? undefined : yRow.get(cellId),
                  ),
                );
              },
              () =>
                mapForEach(keys, (rowId, {action}) =>
                  objSet(
                    table,
                    rowId,
                    action == DELETE
                      ? undefined
                      : yMapToObj(yTable.get(rowId) as YMap<Cell>),
                  ),
                ),
            );
          },
          () =>
            mapForEach(keys, (tableId, {action}) =>
              objSet(
                tables,
                tableId,
                action == DELETE
                  ? undefined
                  : yMapToObj(
                      yTables.get(tableId) as YMap<YMap<Cell>>,
                      (yRow) => yMapToObj(yRow),
                    ),
              ),
            ),
        )
      : mapForEach(keys, (valueId, {action}) =>
          objSet(
            values,
            valueId,
            action == DELETE ? undefined : yValues.get(valueId),
          ),
        ),
  );
  return [tables, values, 1];
};

const applyChangesToYDoc = (
  yContent: YMap<any>,
  getContent: () => Content,
  changes?: Changes,
) => {
  if (!yContent.size) {
    yContent.set(T, new YMap());
    yContent.set(V, new YMap());
  }
  const [yTables, yValues] = getYContent(yContent);
  const changesDidFail = () => {
    changesFailed = 1;
  };
  let changesFailed = 1;
  ifNotUndefined(changes, ([cellChanges, valueChanges]) => {
    changesFailed = 0;
    objForEach(cellChanges, (table, tableId) =>
      changesFailed
        ? 0
        : isUndefined(table)
          ? yTables.delete(tableId)
          : ifNotUndefined(
              yTables.get(tableId),
              (yTable) =>
                objForEach(table, (row, rowId) =>
                  changesFailed
                    ? 0
                    : isUndefined(row)
                      ? yTable.delete(rowId)
                      : ifNotUndefined(
                          yTable.get(rowId),
                          (yRow) =>
                            objForEach(row, (cell, cellId) =>
                              isUndefined(cell)
                                ? yRow.delete(cellId)
                                : yRow.set(cellId, cell),
                            ),
                          changesDidFail,
                        ),
                ),
              changesDidFail,
            ),
    );
    objForEach(valueChanges, (value, valueId) =>
      changesFailed
        ? 0
        : isUndefined(value)
          ? yValues.delete(valueId)
          : yValues.set(valueId, value),
    );
  });
  if (changesFailed) {
    const [tables, values] = getContent();
    yMapMatch(yTables, undefined, tables, (_, tableId, table) =>
      yMapMatch(yTables, tableId, table, (yTable, rowId, row) =>
        yMapMatch(yTable, rowId, row, (yRow, cellId, cell) => {
          if (yRow.get(cellId) !== cell) {
            yRow.set(cellId, cell);
            return 1;
          }
        }),
      ),
    );
    yMapMatch(yValues, undefined, values, (_, valueId, value) => {
      if (yValues.get(valueId) !== value) {
        yValues.set(valueId, value);
      }
    });
  }
};

const yMapMatch = (
  yMapOrParent: YMap<any>,
  idInParent: Id | undefined,
  obj: IdObj<any>,
  set: (yMap: YMap<any>, id: Id, value: any) => 1 | void,
): 1 | void => {
  const yMap = isUndefined(idInParent)
    ? yMapOrParent
    : (yMapOrParent.get(idInParent) ??
      yMapOrParent.set(idInParent, new YMap()));
  let changed: 1 | undefined;
  objForEach(obj, (value, id) => {
    if (set(yMap, id, value)) {
      changed = 1;
    }
  });
  yMap.forEach((_: any, id: Id) => {
    if (!objHas(obj, id)) {
      yMap.delete(id);
      changed = 1;
    }
  });
  if (!isUndefined(idInParent) && !yMap.size) {
    yMapOrParent.delete(idInParent);
  }
  return changed;
};

export const createYjsPersister = ((
  store: Store,
  yDoc: YDoc,
  yMapName = TINYBASE,
  onIgnoredError?: (error: any) => void,
): YjsPersister => {
  const yContent: YMap<any> = yDoc.getMap(yMapName);

  const getPersisted = async (): Promise<Content | undefined> =>
    yContent.size ? getYContentAsContent(yContent) : undefined;

  const setPersisted = async (
    getContent: () => Content,
    changes?: Changes,
  ): Promise<void> =>
    yDoc.transact(() => applyChangesToYDoc(yContent, getContent, changes));

  const addPersisterListener = (listener: PersisterListener): Observer => {
    const observer: Observer = (events) => {
      tryCatch(
        () => listener(undefined, getChangesFromYDoc(yContent, events)),
        onIgnoredError,
      );
    };
    yContent.observeDeep(observer);
    return observer;
  };

  const delPersisterListener = (observer: Observer): void => {
    yContent.unobserveDeep(observer);
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    1, // StoreOnly,
    {getYDoc: () => yDoc},
  ) as YjsPersister;
}) as typeof createYjsPersisterDecl;
