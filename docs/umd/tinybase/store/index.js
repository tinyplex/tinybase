(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.TinyBaseStore = {})));
})(this, function (exports) {
  'use strict';

  const getTypeOf = (thing) => typeof thing;
  const EMPTY_STRING = '';
  const STRING = getTypeOf(EMPTY_STRING);
  const BOOLEAN = getTypeOf(true);
  const NUMBER = getTypeOf(0);
  const FUNCTION = getTypeOf(getTypeOf);
  const TYPE = 'type';
  const DEFAULT = 'default';
  const LISTENER = 'Listener';
  const ADD = 'add';
  const HAS = 'Has';
  const IDS = 'Ids';
  const TABLE = 'Table';
  const TABLES = TABLE + 's';
  const TABLE_IDS = TABLE + IDS;
  const ROW = 'Row';
  const ROW_COUNT = ROW + 'Count';
  const ROW_IDS = ROW + IDS;
  const CELL = 'Cell';
  const CELL_IDS = CELL + IDS;
  const VALUE = 'Value';
  const VALUES = VALUE + 's';
  const VALUE_IDS = VALUE + IDS;
  const id = (key) => EMPTY_STRING + key;

  const isFiniteNumber = isFinite;
  const isInstanceOf = (thing, cls) => thing instanceof cls;
  const isUndefined = (thing) => thing == void 0;
  const ifNotUndefined = (value, then, otherwise) =>
    isUndefined(value) ? otherwise?.() : then(value);
  const isTypeStringOrBoolean = (type) => type == STRING || type == BOOLEAN;
  const isFunction = (thing) => getTypeOf(thing) == FUNCTION;
  const isArray = (thing) => Array.isArray(thing);
  const slice = (arrayOrString, start, end) => arrayOrString.slice(start, end);
  const size = (arrayOrString) => arrayOrString.length;
  const test = (regex, subject) => regex.test(subject);

  const arrayHas = (array, value) => array.includes(value);
  const arrayEvery = (array, cb) => array.every(cb);
  const arrayIsEqual = (array1, array2) =>
    size(array1) === size(array2) &&
    arrayEvery(array1, (value1, index) => array2[index] === value1);
  const arraySort = (array, sorter) => array.sort(sorter);
  const arrayForEach = (array, cb) => array.forEach(cb);
  const arrayMap = (array, cb) => array.map(cb);
  const arrayReduce = (array, cb, initial) => array.reduce(cb, initial);
  const arrayPush = (array, ...values) => array.push(...values);
  const arrayShift = (array) => array.shift();

  const object = Object;
  const getPrototypeOf = (obj) => object.getPrototypeOf(obj);
  const objEntries = object.entries;
  const objFrozen = object.isFrozen;
  const isObject = (obj) =>
    !isUndefined(obj) &&
    ifNotUndefined(
      getPrototypeOf(obj),
      (objPrototype) =>
        objPrototype == object.prototype ||
        isUndefined(getPrototypeOf(objPrototype)),

      /* istanbul ignore next */
      () => true,
    );
  const objIds = object.keys;
  const objFreeze = object.freeze;
  const objNew = (entries = []) => object.fromEntries(entries);
  const objHas = (obj, id) => id in obj;
  const objDel = (obj, id) => {
    delete obj[id];
    return obj;
  };
  const objForEach = (obj, cb) =>
    arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));
  const objToArray = (obj, cb) =>
    arrayMap(objEntries(obj), ([id, value]) => cb(value, id));
  const objMap = (obj, cb) =>
    objNew(objToArray(obj, (value, id) => [id, cb(value, id)]));
  const objSize = (obj) => size(objIds(obj));
  const objIsEmpty = (obj) => isObject(obj) && objSize(obj) == 0;
  const objValidate = (obj, validateChild, onInvalidObj, emptyIsValid = 0) => {
    if (
      isUndefined(obj) ||
      !isObject(obj) ||
      (!emptyIsValid && objIsEmpty(obj)) ||
      objFrozen(obj)
    ) {
      onInvalidObj?.();
      return false;
    }
    objForEach(obj, (child, id) => {
      if (!validateChild(child, id)) {
        objDel(obj, id);
      }
    });
    return emptyIsValid ? true : !objIsEmpty(obj);
  };

  const collSizeN = (collSizer) => (coll) =>
    arrayReduce(
      collValues(coll),
      (total, coll2) => total + collSizer(coll2),
      0,
    );
  const collSize = (coll) => coll?.size ?? 0;
  const collSize2 = collSizeN(collSize);
  const collSize3 = collSizeN(collSize2);
  const collSize4 = collSizeN(collSize3);
  const collHas = (coll, keyOrValue) => coll?.has(keyOrValue) ?? false;
  const collIsEmpty = (coll) => isUndefined(coll) || collSize(coll) == 0;
  const collValues = (coll) => [...(coll?.values() ?? [])];
  const collClear = (coll) => coll.clear();
  const collForEach = (coll, cb) => coll?.forEach(cb);
  const collDel = (coll, keyOrValue) => coll?.delete(keyOrValue);

  const mapNew = (entries) => new Map(entries);
  const mapKeys = (map) => [...(map?.keys() ?? [])];
  const mapGet = (map, key) => map?.get(key);
  const mapForEach = (map, cb) =>
    collForEach(map, (value, key) => cb(key, value));
  const mapMap = (coll, cb) =>
    arrayMap([...(coll?.entries() ?? [])], ([key, value]) => cb(value, key));
  const mapSet = (map, key, value) =>
    isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);
  const mapEnsure = (map, key, getDefaultValue, hadExistingValue) => {
    if (!collHas(map, key)) {
      mapSet(map, key, getDefaultValue());
    } else {
      hadExistingValue?.(mapGet(map, key));
    }
    return mapGet(map, key);
  };
  const mapMatch = (map, obj, set, del = mapSet) => {
    objMap(obj, (value, id) => set(map, id, value));
    mapForEach(map, (id) => (objHas(obj, id) ? 0 : del(map, id)));
    return map;
  };
  const mapToObj = (map, valueMapper, excludeMapValue, excludeObjValue) => {
    const obj = {};
    collForEach(map, (mapValue, id) => {
      if (!excludeMapValue?.(mapValue, id)) {
        const objValue = valueMapper ? valueMapper(mapValue, id) : mapValue;
        if (!excludeObjValue?.(objValue)) {
          obj[id] = objValue;
        }
      }
    });
    return obj;
  };
  const mapToObj2 = (map, valueMapper, excludeMapValue) =>
    mapToObj(
      map,
      (childMap) => mapToObj(childMap, valueMapper, excludeMapValue),
      collIsEmpty,
      objIsEmpty,
    );
  const mapToObj3 = (map, valueMapper, excludeMapValue) =>
    mapToObj(
      map,
      (childMap) => mapToObj2(childMap, valueMapper, excludeMapValue),
      collIsEmpty,
      objIsEmpty,
    );
  const mapClone = (map, mapValue) => {
    const map2 = mapNew();
    collForEach(map, (value, key) => map2.set(key, mapValue?.(value) ?? value));
    return map2;
  };
  const mapClone2 = (map) => mapClone(map, mapClone);
  const mapClone3 = (map) => mapClone(map, mapClone2);
  const visitTree = (node, path, ensureLeaf, pruneLeaf, p = 0) =>
    ifNotUndefined(
      (ensureLeaf ? mapEnsure : mapGet)(
        node,
        path[p],
        p > size(path) - 2 ? ensureLeaf : mapNew,
      ),
      (nodeOrLeaf) => {
        if (p > size(path) - 2) {
          if (pruneLeaf?.(nodeOrLeaf)) {
            mapSet(node, path[p]);
          }
          return nodeOrLeaf;
        }
        const leaf = visitTree(nodeOrLeaf, path, ensureLeaf, pruneLeaf, p + 1);
        if (collIsEmpty(nodeOrLeaf)) {
          mapSet(node, path[p]);
        }
        return leaf;
      },
    );

  const setNew = (entryOrEntries) =>
    new Set(
      isArray(entryOrEntries) || isUndefined(entryOrEntries)
        ? entryOrEntries
        : [entryOrEntries],
    );
  const setAdd = (set, value) => set?.add(value);

  const INTEGER = /^\d+$/;
  const getPoolFunctions = () => {
    const pool = [];
    let nextId = 0;
    return [
      (reuse) => (reuse ? arrayShift(pool) : null) ?? EMPTY_STRING + nextId++,
      (id) => {
        if (test(INTEGER, id) && size(pool) < 1e3) {
          arrayPush(pool, id);
        }
      },
    ];
  };

  const getWildcardedLeaves = (deepIdSet, path = [EMPTY_STRING]) => {
    const leaves = [];
    const deep = (node, p) =>
      p == size(path)
        ? arrayPush(leaves, node)
        : path[p] === null
          ? collForEach(node, (node2) => deep(node2, p + 1))
          : arrayForEach([path[p], null], (id) =>
              deep(mapGet(node, id), p + 1),
            );
    deep(deepIdSet, 0);
    return leaves;
  };
  const getListenerFunctions = (getThing) => {
    let thing;
    const [getId, releaseId] = getPoolFunctions();
    const allListeners = mapNew();
    const addListener = (
      listener,
      idSetNode,
      path,
      pathGetters = [],
      extraArgsGetter = () => [],
    ) => {
      thing ??= getThing();
      const id = getId(1);
      mapSet(allListeners, id, [
        listener,
        idSetNode,
        path,
        pathGetters,
        extraArgsGetter,
      ]);
      setAdd(visitTree(idSetNode, path ?? [EMPTY_STRING], setNew), id);
      return id;
    };
    const callListeners = (idSetNode, ids, ...extraArgs) =>
      arrayForEach(getWildcardedLeaves(idSetNode, ids), (set) =>
        collForEach(set, (id) =>
          mapGet(allListeners, id)[0](thing, ...(ids ?? []), ...extraArgs),
        ),
      );
    const delListener = (id) =>
      ifNotUndefined(mapGet(allListeners, id), ([, idSetNode, idOrNulls]) => {
        visitTree(idSetNode, idOrNulls ?? [EMPTY_STRING], void 0, (idSet) => {
          collDel(idSet, id);
          return collIsEmpty(idSet) ? 1 : 0;
        });
        mapSet(allListeners, id);
        releaseId(id);
        return idOrNulls;
      });
    const callListener = (id) =>
      ifNotUndefined(
        mapGet(allListeners, id),
        ([listener, , path = [], pathGetters, extraArgsGetter]) => {
          const callWithIds = (...ids) => {
            const index = size(ids);
            if (index == size(path)) {
              listener(thing, ...ids, ...extraArgsGetter(ids));
            } else if (isUndefined(path[index])) {
              arrayForEach(pathGetters[index]?.(...ids) ?? [], (id2) =>
                callWithIds(...ids, id2),
              );
            } else {
              callWithIds(...ids, path[index]);
            }
          };
          callWithIds();
        },
      );
    return [addListener, callListeners, delListener, callListener];
  };

  const pairNew = (value) => [value, value];
  const pairCollSize2 = (pair, func = collSize2) =>
    func(pair[0]) + func(pair[1]);
  const pairNewMap = () => [mapNew(), mapNew()];
  const pairClone = (array) => [...array];
  const pairIsEqual = ([entry1, entry2]) => entry1 === entry2;

  const getCellOrValueType = (cellOrValue) => {
    const type = getTypeOf(cellOrValue);
    return isTypeStringOrBoolean(type) ||
      (type == NUMBER && isFiniteNumber(cellOrValue))
      ? type
      : void 0;
  };
  const setOrDelCell = (store, tableId, rowId, cellId, cell) =>
    isUndefined(cell)
      ? store.delCell(tableId, rowId, cellId, true)
      : store.setCell(tableId, rowId, cellId, cell);
  const setOrDelValue = (store, valueId, value) =>
    isUndefined(value)
      ? store.delValue(valueId)
      : store.setValue(valueId, value);

  const jsonString = JSON.stringify;
  const jsonParse = JSON.parse;
  const jsonStringWithMap = (obj) =>
    jsonString(obj, (_key, value) =>
      isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
    );

  const defaultSorter = (sortKey1, sortKey2) =>
    (sortKey1 ?? 0) < (sortKey2 ?? 0) ? -1 : 1;

  const idsChanged = (changedIds, id2, addedOrRemoved) =>
    mapSet(
      changedIds,
      id2,
      mapGet(changedIds, id2) == -addedOrRemoved ? void 0 : addedOrRemoved,
    );
  const createStore = () => {
    let hasTablesSchema;
    let hasValuesSchema;
    let hadTables = false;
    let hadValues = false;
    let transactions = 0;
    let internalListeners = [];
    const changedTableIds = mapNew();
    const changedTableCellIds = mapNew();
    const changedRowCount = mapNew();
    const changedRowIds = mapNew();
    const changedCellIds = mapNew();
    const changedCells = mapNew();
    const changedValueIds = mapNew();
    const changedValues = mapNew();
    const invalidCells = mapNew();
    const invalidValues = mapNew();
    const tablesSchemaMap = mapNew();
    const tablesSchemaRowCache = mapNew();
    const valuesSchemaMap = mapNew();
    const valuesDefaulted = mapNew();
    const valuesNonDefaulted = setNew();
    const tablePoolFunctions = mapNew();
    const tableCellIds = mapNew();
    const tablesMap = mapNew();
    const valuesMap = mapNew();
    const hasTablesListeners = pairNewMap();
    const tablesListeners = pairNewMap();
    const tableIdsListeners = pairNewMap();
    const hasTableListeners = pairNewMap();
    const tableListeners = pairNewMap();
    const tableCellIdsListeners = pairNewMap();
    const hasTableCellListeners = pairNewMap();
    const rowCountListeners = pairNewMap();
    const rowIdsListeners = pairNewMap();
    const sortedRowIdsListeners = pairNewMap();
    const hasRowListeners = pairNewMap();
    const rowListeners = pairNewMap();
    const cellIdsListeners = pairNewMap();
    const hasCellListeners = pairNewMap();
    const cellListeners = pairNewMap();
    const invalidCellListeners = pairNewMap();
    const invalidValueListeners = pairNewMap();
    const hasValuesListeners = pairNewMap();
    const valuesListeners = pairNewMap();
    const valueIdsListeners = pairNewMap();
    const hasValueListeners = pairNewMap();
    const valueListeners = pairNewMap();
    const startTransactionListeners = mapNew();
    const finishTransactionListeners = pairNewMap();
    const [addListener, callListeners, delListenerImpl, callListenerImpl] =
      getListenerFunctions(() => store);
    const validateTablesSchema = (tableSchema) =>
      objValidate(tableSchema, (tableSchema2) =>
        objValidate(tableSchema2, validateCellOrValueSchema),
      );
    const validateValuesSchema = (valuesSchema) =>
      objValidate(valuesSchema, validateCellOrValueSchema);
    const validateCellOrValueSchema = (schema) => {
      if (
        !objValidate(schema, (_child, id2) => arrayHas([TYPE, DEFAULT], id2))
      ) {
        return false;
      }
      const type = schema[TYPE];
      if (!isTypeStringOrBoolean(type) && type != NUMBER) {
        return false;
      }
      if (getCellOrValueType(schema[DEFAULT]) != type) {
        objDel(schema, DEFAULT);
      }
      return true;
    };
    const validateContent = isArray;
    const validateTables = (tables) =>
      objValidate(tables, validateTable, cellInvalid);
    const validateTable = (table, tableId) =>
      (!hasTablesSchema ||
        collHas(tablesSchemaMap, tableId) ||
        /* istanbul ignore next */
        cellInvalid(tableId)) &&
      objValidate(
        table,
        (row, rowId) => validateRow(tableId, rowId, row),
        () => cellInvalid(tableId),
      );
    const validateRow = (tableId, rowId, row, skipDefaults) =>
      objValidate(
        skipDefaults ? row : addDefaultsToRow(row, tableId, rowId),
        (cell, cellId) =>
          ifNotUndefined(
            getValidatedCell(tableId, rowId, cellId, cell),
            (validCell) => {
              row[cellId] = validCell;
              return true;
            },
            () => false,
          ),
        () => cellInvalid(tableId, rowId),
      );
    const getValidatedCell = (tableId, rowId, cellId, cell) =>
      hasTablesSchema
        ? ifNotUndefined(
            mapGet(mapGet(tablesSchemaMap, tableId), cellId),
            (cellSchema) =>
              getCellOrValueType(cell) != cellSchema[TYPE]
                ? cellInvalid(tableId, rowId, cellId, cell, cellSchema[DEFAULT])
                : cell,
            () => cellInvalid(tableId, rowId, cellId, cell),
          )
        : isUndefined(getCellOrValueType(cell))
          ? cellInvalid(tableId, rowId, cellId, cell)
          : cell;
    const validateValues = (values, skipDefaults) =>
      objValidate(
        skipDefaults ? values : addDefaultsToValues(values),
        (value, valueId) =>
          ifNotUndefined(
            getValidatedValue(valueId, value),
            (validValue) => {
              values[valueId] = validValue;
              return true;
            },
            () => false,
          ),
        () => valueInvalid(),
      );
    const getValidatedValue = (valueId, value) =>
      hasValuesSchema
        ? ifNotUndefined(
            mapGet(valuesSchemaMap, valueId),
            (valueSchema) =>
              getCellOrValueType(value) != valueSchema[TYPE]
                ? valueInvalid(valueId, value, valueSchema[DEFAULT])
                : value,
            () => valueInvalid(valueId, value),
          )
        : isUndefined(getCellOrValueType(value))
          ? valueInvalid(valueId, value)
          : value;
    const addDefaultsToRow = (row, tableId, rowId) => {
      ifNotUndefined(
        mapGet(tablesSchemaRowCache, tableId),
        ([rowDefaulted, rowNonDefaulted]) => {
          collForEach(rowDefaulted, (cell, cellId) => {
            if (!objHas(row, cellId)) {
              row[cellId] = cell;
            }
          });
          collForEach(rowNonDefaulted, (cellId) => {
            if (!objHas(row, cellId)) {
              cellInvalid(tableId, rowId, cellId);
            }
          });
        },
      );
      return row;
    };
    const addDefaultsToValues = (values) => {
      if (hasValuesSchema) {
        collForEach(valuesDefaulted, (value, valueId) => {
          if (!objHas(values, valueId)) {
            values[valueId] = value;
          }
        });
        collForEach(valuesNonDefaulted, (valueId) => {
          if (!objHas(values, valueId)) {
            valueInvalid(valueId);
          }
        });
      }
      return values;
    };
    const setValidTablesSchema = (tablesSchema) =>
      mapMatch(
        tablesSchemaMap,
        tablesSchema,
        (_tablesSchema, tableId, tableSchema) => {
          const rowDefaulted = mapNew();
          const rowNonDefaulted = setNew();
          mapMatch(
            mapEnsure(tablesSchemaMap, tableId, mapNew),
            tableSchema,
            (tableSchemaMap, cellId, cellSchema) => {
              mapSet(tableSchemaMap, cellId, cellSchema);
              ifNotUndefined(
                cellSchema[DEFAULT],
                (def) => mapSet(rowDefaulted, cellId, def),
                () => setAdd(rowNonDefaulted, cellId),
              );
            },
          );
          mapSet(tablesSchemaRowCache, tableId, [
            rowDefaulted,
            rowNonDefaulted,
          ]);
        },
        (_tablesSchema, tableId) => {
          mapSet(tablesSchemaMap, tableId);
          mapSet(tablesSchemaRowCache, tableId);
        },
      );
    const setValidValuesSchema = (valuesSchema) =>
      mapMatch(
        valuesSchemaMap,
        valuesSchema,
        (_valuesSchema, valueId, valueSchema) => {
          mapSet(valuesSchemaMap, valueId, valueSchema);
          ifNotUndefined(
            valueSchema[DEFAULT],
            (def) => mapSet(valuesDefaulted, valueId, def),
            () => setAdd(valuesNonDefaulted, valueId),
          );
        },
        (_valuesSchema, valueId) => {
          mapSet(valuesSchemaMap, valueId);
          mapSet(valuesDefaulted, valueId);
          collDel(valuesNonDefaulted, valueId);
        },
      );
    const setOrDelTables = (tables) =>
      objIsEmpty(tables) ? delTables() : setTables(tables);
    const setValidContent = ([tables, values]) => {
      (objIsEmpty(tables) ? delTables : setTables)(tables);
      (objIsEmpty(values) ? delValues : setValues)(values);
    };
    const setValidTables = (tables) =>
      mapMatch(
        tablesMap,
        tables,
        (_tables, tableId, table) => setValidTable(tableId, table),
        (_tables, tableId) => delValidTable(tableId),
      );
    const setValidTable = (tableId, table) =>
      mapMatch(
        mapEnsure(tablesMap, tableId, () => {
          tableIdsChanged(tableId, 1);
          mapSet(tablePoolFunctions, tableId, getPoolFunctions());
          mapSet(tableCellIds, tableId, mapNew());
          return mapNew();
        }),
        table,
        (tableMap, rowId, row) => setValidRow(tableId, tableMap, rowId, row),
        (tableMap, rowId) => delValidRow(tableId, tableMap, rowId),
      );
    const setValidRow = (tableId, tableMap, rowId, row, forceDel) =>
      mapMatch(
        mapEnsure(tableMap, rowId, () => {
          rowIdsChanged(tableId, rowId, 1);
          return mapNew();
        }),
        row,
        (rowMap, cellId, cell) =>
          setValidCell(tableId, rowId, rowMap, cellId, cell),
        (rowMap, cellId) =>
          delValidCell(tableId, tableMap, rowId, rowMap, cellId, forceDel),
      );
    const setValidCell = (tableId, rowId, rowMap, cellId, cell) => {
      if (!collHas(rowMap, cellId)) {
        cellIdsChanged(tableId, rowId, cellId, 1);
      }
      const oldCell = mapGet(rowMap, cellId);
      if (cell !== oldCell) {
        cellChanged(tableId, rowId, cellId, oldCell, cell);
        mapSet(rowMap, cellId, cell);
      }
    };
    const setCellIntoDefaultRow = (
      tableId,
      tableMap,
      rowId,
      cellId,
      validCell,
    ) =>
      ifNotUndefined(
        mapGet(tableMap, rowId),
        (rowMap) => setValidCell(tableId, rowId, rowMap, cellId, validCell),
        () =>
          setValidRow(
            tableId,
            tableMap,
            rowId,
            addDefaultsToRow({[cellId]: validCell}, tableId, rowId),
          ),
      );
    const setOrDelValues = (values) =>
      objIsEmpty(values) ? delValues() : setValues(values);
    const setValidValues = (values) =>
      mapMatch(
        valuesMap,
        values,
        (_valuesMap, valueId, value) => setValidValue(valueId, value),
        (_valuesMap, valueId) => delValidValue(valueId),
      );
    const setValidValue = (valueId, value) => {
      if (!collHas(valuesMap, valueId)) {
        valueIdsChanged(valueId, 1);
      }
      const oldValue = mapGet(valuesMap, valueId);
      if (value !== oldValue) {
        valueChanged(valueId, oldValue, value);
        mapSet(valuesMap, valueId, value);
      }
    };
    const getNewRowId = (tableId, reuse) => {
      const [getId] = mapGet(tablePoolFunctions, tableId);
      let rowId;
      do {
        rowId = getId(reuse);
      } while (collHas(mapGet(tablesMap, tableId), rowId));
      return rowId;
    };
    const getOrCreateTable = (tableId) =>
      mapGet(tablesMap, tableId) ?? setValidTable(tableId, {});
    const delValidTable = (tableId) => setValidTable(tableId, {});
    const delValidRow = (tableId, tableMap, rowId) => {
      const [, releaseId] = mapGet(tablePoolFunctions, tableId);
      releaseId(rowId);
      setValidRow(tableId, tableMap, rowId, {}, true);
    };
    const delValidCell = (tableId, table, rowId, row, cellId, forceDel) => {
      const defaultCell = mapGet(
        mapGet(tablesSchemaRowCache, tableId)?.[0],
        cellId,
      );
      if (!isUndefined(defaultCell) && !forceDel) {
        return setValidCell(tableId, rowId, row, cellId, defaultCell);
      }
      const delCell2 = (cellId2) => {
        cellChanged(tableId, rowId, cellId2, mapGet(row, cellId2));
        cellIdsChanged(tableId, rowId, cellId2, -1);
        mapSet(row, cellId2);
      };
      if (isUndefined(defaultCell)) {
        delCell2(cellId);
      } else {
        mapForEach(row, delCell2);
      }
      if (collIsEmpty(row)) {
        rowIdsChanged(tableId, rowId, -1);
        if (collIsEmpty(mapSet(table, rowId))) {
          tableIdsChanged(tableId, -1);
          mapSet(tablesMap, tableId);
          mapSet(tablePoolFunctions, tableId);
          mapSet(tableCellIds, tableId);
        }
      }
    };
    const delValidValue = (valueId) => {
      const defaultValue = mapGet(valuesDefaulted, valueId);
      if (!isUndefined(defaultValue)) {
        return setValidValue(valueId, defaultValue);
      }
      valueChanged(valueId, mapGet(valuesMap, valueId));
      valueIdsChanged(valueId, -1);
      mapSet(valuesMap, valueId);
    };
    const tableIdsChanged = (tableId, addedOrRemoved) =>
      idsChanged(changedTableIds, tableId, addedOrRemoved);
    const rowIdsChanged = (tableId, rowId, addedOrRemoved) =>
      idsChanged(
        mapEnsure(changedRowIds, tableId, mapNew),
        rowId,
        addedOrRemoved,
      ) &&
      mapSet(
        changedRowCount,
        tableId,
        mapEnsure(changedRowCount, tableId, () => 0) + addedOrRemoved,
      );
    const cellIdsChanged = (tableId, rowId, cellId, addedOrRemoved) => {
      const cellIds = mapGet(tableCellIds, tableId);
      const count = mapGet(cellIds, cellId) ?? 0;
      if (
        (count == 0 && addedOrRemoved == 1) ||
        (count == 1 && addedOrRemoved == -1)
      ) {
        idsChanged(
          mapEnsure(changedTableCellIds, tableId, mapNew),
          cellId,
          addedOrRemoved,
        );
      }
      mapSet(
        cellIds,
        cellId,
        count != -addedOrRemoved ? count + addedOrRemoved : null,
      );
      idsChanged(
        mapEnsure(mapEnsure(changedCellIds, tableId, mapNew), rowId, mapNew),
        cellId,
        addedOrRemoved,
      );
    };
    const cellChanged = (tableId, rowId, cellId, oldCell, newCell) => {
      mapEnsure(
        mapEnsure(mapEnsure(changedCells, tableId, mapNew), rowId, mapNew),
        cellId,
        () => [oldCell, 0],
      )[1] = newCell;
      internalListeners[3]?.(tableId, rowId, cellId, newCell);
    };
    const valueIdsChanged = (valueId, addedOrRemoved) =>
      idsChanged(changedValueIds, valueId, addedOrRemoved);
    const valueChanged = (valueId, oldValue, newValue) => {
      mapEnsure(changedValues, valueId, () => [oldValue, 0])[1] = newValue;
      internalListeners[4]?.(valueId, newValue);
    };
    const cellInvalid = (
      tableId,
      rowId,
      cellId,
      invalidCell,
      defaultedCell,
    ) => {
      arrayPush(
        mapEnsure(
          mapEnsure(mapEnsure(invalidCells, tableId, mapNew), rowId, mapNew),
          cellId,
          () => [],
        ),
        invalidCell,
      );
      return defaultedCell;
    };
    const valueInvalid = (valueId, invalidValue, defaultedValue) => {
      arrayPush(
        mapEnsure(invalidValues, valueId, () => []),
        invalidValue,
      );
      return defaultedValue;
    };
    const getCellChange = (tableId, rowId, cellId) =>
      ifNotUndefined(
        mapGet(mapGet(mapGet(changedCells, tableId), rowId), cellId),
        ([oldCell, newCell]) => [true, oldCell, newCell],
        () => [false, ...pairNew(getCell(tableId, rowId, cellId))],
      );
    const getValueChange = (valueId) =>
      ifNotUndefined(
        mapGet(changedValues, valueId),
        ([oldValue, newValue]) => [true, oldValue, newValue],
        () => [false, ...pairNew(getValue(valueId))],
      );
    const callInvalidCellListeners = (mutator) =>
      !collIsEmpty(invalidCells) && !collIsEmpty(invalidCellListeners[mutator])
        ? collForEach(
            mutator ? mapClone3(invalidCells) : invalidCells,
            (rows, tableId) =>
              collForEach(rows, (cells, rowId) =>
                collForEach(cells, (invalidCell, cellId) =>
                  callListeners(
                    invalidCellListeners[mutator],
                    [tableId, rowId, cellId],
                    invalidCell,
                  ),
                ),
              ),
          )
        : 0;
    const callInvalidValueListeners = (mutator) =>
      !collIsEmpty(invalidValues) &&
      !collIsEmpty(invalidValueListeners[mutator])
        ? collForEach(
            mutator ? mapClone(invalidValues) : invalidValues,
            (invalidValue, valueId) =>
              callListeners(
                invalidValueListeners[mutator],
                [valueId],
                invalidValue,
              ),
          )
        : 0;
    const callIdsAndHasListenersIfChanged = (
      changedIds,
      idListeners,
      hasListeners,
      ids,
    ) => {
      if (!collIsEmpty(changedIds)) {
        callListeners(idListeners, ids, () => mapToObj(changedIds));
        mapForEach(changedIds, (changedId, changed) =>
          callListeners(
            hasListeners,
            [...(ids ?? []), changedId],
            changed == 1,
          ),
        );
        return 1;
      }
    };
    const callTabularListenersForChanges = (mutator) => {
      const hasTablesNow = hasTables();
      if (hasTablesNow != hadTables) {
        callListeners(hasTablesListeners[mutator], void 0, hasTablesNow);
      }
      const emptySortedRowIdListeners = collIsEmpty(
        sortedRowIdsListeners[mutator],
      );
      const emptyIdAndHasListeners =
        collIsEmpty(cellIdsListeners[mutator]) &&
        collIsEmpty(hasCellListeners[mutator]) &&
        collIsEmpty(rowIdsListeners[mutator]) &&
        collIsEmpty(hasRowListeners[mutator]) &&
        collIsEmpty(tableCellIdsListeners[mutator]) &&
        collIsEmpty(hasTableCellListeners[mutator]) &&
        collIsEmpty(rowCountListeners[mutator]) &&
        emptySortedRowIdListeners &&
        collIsEmpty(tableIdsListeners[mutator]) &&
        collIsEmpty(hasTableListeners[mutator]);
      const emptyOtherListeners =
        collIsEmpty(cellListeners[mutator]) &&
        collIsEmpty(rowListeners[mutator]) &&
        collIsEmpty(tableListeners[mutator]) &&
        collIsEmpty(tablesListeners[mutator]);
      if (!emptyIdAndHasListeners || !emptyOtherListeners) {
        const changes = mutator
          ? [
              mapClone(changedTableIds),
              mapClone2(changedTableCellIds),
              mapClone(changedRowCount),
              mapClone2(changedRowIds),
              mapClone3(changedCellIds),
              mapClone3(changedCells),
            ]
          : [
              changedTableIds,
              changedTableCellIds,
              changedRowCount,
              changedRowIds,
              changedCellIds,
              changedCells,
            ];
        if (!emptyIdAndHasListeners) {
          callIdsAndHasListenersIfChanged(
            changes[0],
            tableIdsListeners[mutator],
            hasTableListeners[mutator],
          );
          collForEach(changes[1], (changedIds, tableId) =>
            callIdsAndHasListenersIfChanged(
              changedIds,
              tableCellIdsListeners[mutator],
              hasTableCellListeners[mutator],
              [tableId],
            ),
          );
          collForEach(changes[2], (changedCount, tableId) => {
            if (changedCount != 0) {
              callListeners(
                rowCountListeners[mutator],
                [tableId],
                getRowCount(tableId),
              );
            }
          });
          const calledSortableTableIds = setNew();
          collForEach(changes[3], (changedIds, tableId) => {
            if (
              callIdsAndHasListenersIfChanged(
                changedIds,
                rowIdsListeners[mutator],
                hasRowListeners[mutator],
                [tableId],
              ) &&
              !emptySortedRowIdListeners
            ) {
              callListeners(sortedRowIdsListeners[mutator], [tableId, null]);
              setAdd(calledSortableTableIds, tableId);
            }
          });
          if (!emptySortedRowIdListeners) {
            collForEach(changes[5], (rows, tableId) => {
              if (!collHas(calledSortableTableIds, tableId)) {
                const sortableCellIds = setNew();
                collForEach(rows, (cells) =>
                  collForEach(cells, ([oldCell, newCell], cellId) =>
                    newCell !== oldCell
                      ? setAdd(sortableCellIds, cellId)
                      : collDel(cells, cellId),
                  ),
                );
                collForEach(sortableCellIds, (cellId) =>
                  callListeners(sortedRowIdsListeners[mutator], [
                    tableId,
                    cellId,
                  ]),
                );
              }
            });
          }
          collForEach(changes[4], (rowCellIds, tableId) =>
            collForEach(rowCellIds, (changedIds, rowId) =>
              callIdsAndHasListenersIfChanged(
                changedIds,
                cellIdsListeners[mutator],
                hasCellListeners[mutator],
                [tableId, rowId],
              ),
            ),
          );
        }
        if (!emptyOtherListeners) {
          let tablesChanged;
          collForEach(changes[5], (rows, tableId) => {
            let tableChanged;
            collForEach(rows, (cells, rowId) => {
              let rowChanged;
              collForEach(cells, ([oldCell, newCell], cellId) => {
                if (newCell !== oldCell) {
                  callListeners(
                    cellListeners[mutator],
                    [tableId, rowId, cellId],
                    newCell,
                    oldCell,
                    getCellChange,
                  );
                  tablesChanged = tableChanged = rowChanged = 1;
                }
              });
              if (rowChanged) {
                callListeners(
                  rowListeners[mutator],
                  [tableId, rowId],
                  getCellChange,
                );
              }
            });
            if (tableChanged) {
              callListeners(tableListeners[mutator], [tableId], getCellChange);
            }
          });
          if (tablesChanged) {
            callListeners(tablesListeners[mutator], void 0, getCellChange);
          }
        }
      }
    };
    const callValuesListenersForChanges = (mutator) => {
      const hasValuesNow = hasValues();
      if (hasValuesNow != hadValues) {
        callListeners(hasValuesListeners[mutator], void 0, hasValuesNow);
      }
      const emptyIdAndHasListeners =
        collIsEmpty(valueIdsListeners[mutator]) &&
        collIsEmpty(hasValueListeners[mutator]);
      const emptyOtherListeners =
        collIsEmpty(valueListeners[mutator]) &&
        collIsEmpty(valuesListeners[mutator]);
      if (!emptyIdAndHasListeners || !emptyOtherListeners) {
        const changes = mutator
          ? [mapClone(changedValueIds), mapClone(changedValues)]
          : [changedValueIds, changedValues];
        if (!emptyIdAndHasListeners) {
          callIdsAndHasListenersIfChanged(
            changes[0],
            valueIdsListeners[mutator],
            hasValueListeners[mutator],
          );
        }
        if (!emptyOtherListeners) {
          let valuesChanged;
          collForEach(changes[1], ([oldValue, newValue], valueId) => {
            if (newValue !== oldValue) {
              callListeners(
                valueListeners[mutator],
                [valueId],
                newValue,
                oldValue,
                getValueChange,
              );
              valuesChanged = 1;
            }
          });
          if (valuesChanged) {
            callListeners(valuesListeners[mutator], void 0, getValueChange);
          }
        }
      }
    };
    const fluentTransaction = (actions, ...args) => {
      transaction(() => actions(...arrayMap(args, id)));
      return store;
    };
    const getContent = () => [getTables(), getValues()];
    const getTables = () => mapToObj3(tablesMap);
    const getTableIds = () => mapKeys(tablesMap);
    const getTable = (tableId) => mapToObj2(mapGet(tablesMap, id(tableId)));
    const getTableCellIds = (tableId) =>
      mapKeys(mapGet(tableCellIds, id(tableId)));
    const getRowCount = (tableId) => collSize(mapGet(tablesMap, id(tableId)));
    const getRowIds = (tableId) => mapKeys(mapGet(tablesMap, id(tableId)));
    const getSortedRowIds = (tableId, cellId, descending, offset = 0, limit) =>
      arrayMap(
        slice(
          arraySort(
            mapMap(mapGet(tablesMap, id(tableId)), (row, rowId) => [
              isUndefined(cellId) ? rowId : mapGet(row, id(cellId)),
              rowId,
            ]),
            ([cell1], [cell2]) =>
              defaultSorter(cell1, cell2) * (descending ? -1 : 1),
          ),
          offset,
          isUndefined(limit) ? limit : offset + limit,
        ),
        ([, rowId]) => rowId,
      );
    const getRow = (tableId, rowId) =>
      mapToObj(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
    const getCellIds = (tableId, rowId) =>
      mapKeys(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)));
    const getCell = (tableId, rowId, cellId) =>
      mapGet(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
    const getValues = () => mapToObj(valuesMap);
    const getValueIds = () => mapKeys(valuesMap);
    const getValue = (valueId) => mapGet(valuesMap, id(valueId));
    const hasTables = () => !collIsEmpty(tablesMap);
    const hasTable = (tableId) => collHas(tablesMap, id(tableId));
    const hasTableCell = (tableId, cellId) =>
      collHas(mapGet(tableCellIds, id(tableId)), id(cellId));
    const hasRow = (tableId, rowId) =>
      collHas(mapGet(tablesMap, id(tableId)), id(rowId));
    const hasCell = (tableId, rowId, cellId) =>
      collHas(mapGet(mapGet(tablesMap, id(tableId)), id(rowId)), id(cellId));
    const hasValues = () => !collIsEmpty(valuesMap);
    const hasValue = (valueId) => collHas(valuesMap, id(valueId));
    const getTablesJson = () => jsonStringWithMap(tablesMap);
    const getValuesJson = () => jsonStringWithMap(valuesMap);
    const getJson = () => jsonStringWithMap([tablesMap, valuesMap]);
    const getTablesSchemaJson = () => jsonStringWithMap(tablesSchemaMap);
    const getValuesSchemaJson = () => jsonStringWithMap(valuesSchemaMap);
    const getSchemaJson = () =>
      jsonStringWithMap([tablesSchemaMap, valuesSchemaMap]);
    const setContent = (content) =>
      fluentTransaction(() => {
        const content2 = isFunction(content) ? content() : content;
        if (validateContent(content2)) {
          setValidContent(content2);
        }
      });
    const setTables = (tables) =>
      fluentTransaction(() =>
        validateTables(tables) ? setValidTables(tables) : 0,
      );
    const setTable = (tableId, table) =>
      fluentTransaction(
        (tableId2) =>
          validateTable(table, tableId2) ? setValidTable(tableId2, table) : 0,
        tableId,
      );
    const setRow = (tableId, rowId, row) =>
      fluentTransaction(
        (tableId2, rowId2) =>
          validateRow(tableId2, rowId2, row)
            ? setValidRow(tableId2, getOrCreateTable(tableId2), rowId2, row)
            : 0,
        tableId,
        rowId,
      );
    const addRow = (tableId, row, reuseRowIds = true) =>
      transaction(() => {
        let rowId = void 0;
        if (validateRow(tableId, rowId, row)) {
          tableId = id(tableId);
          setValidRow(
            tableId,
            getOrCreateTable(tableId),
            (rowId = getNewRowId(tableId, reuseRowIds ? 1 : 0)),
            row,
          );
        }
        return rowId;
      });
    const setPartialRow = (tableId, rowId, partialRow) =>
      fluentTransaction(
        (tableId2, rowId2) => {
          if (validateRow(tableId2, rowId2, partialRow, 1)) {
            const table = getOrCreateTable(tableId2);
            objMap(partialRow, (cell, cellId) =>
              setCellIntoDefaultRow(tableId2, table, rowId2, cellId, cell),
            );
          }
        },
        tableId,
        rowId,
      );
    const setCell = (tableId, rowId, cellId, cell) =>
      fluentTransaction(
        (tableId2, rowId2, cellId2) =>
          ifNotUndefined(
            getValidatedCell(
              tableId2,
              rowId2,
              cellId2,
              isFunction(cell)
                ? cell(getCell(tableId2, rowId2, cellId2))
                : cell,
            ),
            (validCell) =>
              setCellIntoDefaultRow(
                tableId2,
                getOrCreateTable(tableId2),
                rowId2,
                cellId2,
                validCell,
              ),
          ),
        tableId,
        rowId,
        cellId,
      );
    const setValues = (values) =>
      fluentTransaction(() =>
        validateValues(values) ? setValidValues(values) : 0,
      );
    const setPartialValues = (partialValues) =>
      fluentTransaction(() =>
        validateValues(partialValues, 1)
          ? objMap(partialValues, (value, valueId) =>
              setValidValue(valueId, value),
            )
          : 0,
      );
    const setValue = (valueId, value) =>
      fluentTransaction(
        (valueId2) =>
          ifNotUndefined(
            getValidatedValue(
              valueId2,
              isFunction(value) ? value(getValue(valueId2)) : value,
            ),
            (validValue) => setValidValue(valueId2, validValue),
          ),
        valueId,
      );
    const applyChanges = (changes) =>
      fluentTransaction(() => {
        objMap(changes[0], (table, tableId) =>
          isUndefined(table)
            ? delTable(tableId)
            : objMap(table, (row, rowId) =>
                isUndefined(row)
                  ? delRow(tableId, rowId)
                  : objMap(row, (cell, cellId) =>
                      setOrDelCell(store, tableId, rowId, cellId, cell),
                    ),
              ),
        );
        objMap(changes[1], (value, valueId) =>
          setOrDelValue(store, valueId, value),
        );
      });
    const setTablesJson = (tablesJson) => {
      try {
        setOrDelTables(jsonParse(tablesJson));
      } catch {}
      return store;
    };
    const setValuesJson = (valuesJson) => {
      try {
        setOrDelValues(jsonParse(valuesJson));
      } catch {}
      return store;
    };
    const setJson = (tablesAndValuesJson) =>
      fluentTransaction(() => {
        try {
          const [tables, values] = jsonParse(tablesAndValuesJson);
          setOrDelTables(tables);
          setOrDelValues(values);
        } catch {
          setTablesJson(tablesAndValuesJson);
        }
      });
    const setTablesSchema = (tablesSchema) =>
      fluentTransaction(() => {
        if ((hasTablesSchema = validateTablesSchema(tablesSchema))) {
          setValidTablesSchema(tablesSchema);
          if (!collIsEmpty(tablesMap)) {
            const tables = getTables();
            delTables();
            setTables(tables);
          }
        }
      });
    const setValuesSchema = (valuesSchema) =>
      fluentTransaction(() => {
        if ((hasValuesSchema = validateValuesSchema(valuesSchema))) {
          const values = getValues();
          delValuesSchema();
          delValues();
          hasValuesSchema = true;
          setValidValuesSchema(valuesSchema);
          setValues(values);
        }
      });
    const setSchema = (tablesSchema, valuesSchema) =>
      fluentTransaction(() => {
        setTablesSchema(tablesSchema);
        setValuesSchema(valuesSchema);
      });
    const delTables = () => fluentTransaction(() => setValidTables({}));
    const delTable = (tableId) =>
      fluentTransaction(
        (tableId2) =>
          collHas(tablesMap, tableId2) ? delValidTable(tableId2) : 0,
        tableId,
      );
    const delRow = (tableId, rowId) =>
      fluentTransaction(
        (tableId2, rowId2) =>
          ifNotUndefined(mapGet(tablesMap, tableId2), (tableMap) =>
            collHas(tableMap, rowId2)
              ? delValidRow(tableId2, tableMap, rowId2)
              : 0,
          ),
        tableId,
        rowId,
      );
    const delCell = (tableId, rowId, cellId, forceDel) =>
      fluentTransaction(
        (tableId2, rowId2, cellId2) =>
          ifNotUndefined(mapGet(tablesMap, tableId2), (tableMap) =>
            ifNotUndefined(mapGet(tableMap, rowId2), (rowMap) =>
              collHas(rowMap, cellId2)
                ? delValidCell(
                    tableId2,
                    tableMap,
                    rowId2,
                    rowMap,
                    cellId2,
                    forceDel,
                  )
                : 0,
            ),
          ),
        tableId,
        rowId,
        cellId,
      );
    const delValues = () => fluentTransaction(() => setValidValues({}));
    const delValue = (valueId) =>
      fluentTransaction(
        (valueId2) =>
          collHas(valuesMap, valueId2) ? delValidValue(valueId2) : 0,
        valueId,
      );
    const delTablesSchema = () =>
      fluentTransaction(() => {
        setValidTablesSchema({});
        hasTablesSchema = false;
      });
    const delValuesSchema = () =>
      fluentTransaction(() => {
        setValidValuesSchema({});
        hasValuesSchema = false;
      });
    const delSchema = () =>
      fluentTransaction(() => {
        delTablesSchema();
        delValuesSchema();
      });
    const transaction = (actions, doRollback) => {
      if (transactions != -1) {
        startTransaction();
        const result = actions();
        finishTransaction(doRollback);
        return result;
      }
    };
    const startTransaction = () => {
      if (transactions != -1) {
        transactions++;
      }
      if (transactions == 1) {
        internalListeners[0]?.();
        callListeners(startTransactionListeners);
      }
      return store;
    };
    const getTransactionChanges = () => [
      mapToObj(
        changedCells,
        (table, tableId) =>
          mapGet(changedTableIds, tableId) === -1
            ? void 0
            : mapToObj(
                table,
                (row, rowId) =>
                  mapGet(mapGet(changedRowIds, tableId), rowId) === -1
                    ? void 0
                    : mapToObj(
                        row,
                        ([, newCell]) => newCell,
                        (changedCell) => pairIsEqual(changedCell),
                      ),
                collIsEmpty,
                objIsEmpty,
              ),
        collIsEmpty,
        objIsEmpty,
      ),
      mapToObj(
        changedValues,
        ([, newValue]) => newValue,
        (changedValue) => pairIsEqual(changedValue),
      ),
      1,
    ];
    const getTransactionLog = () => [
      !collIsEmpty(changedCells),
      !collIsEmpty(changedValues),
      mapToObj3(changedCells, pairClone, pairIsEqual),
      mapToObj3(invalidCells),
      mapToObj(changedValues, pairClone, pairIsEqual),
      mapToObj(invalidValues),
      mapToObj(changedTableIds),
      mapToObj2(changedRowIds),
      mapToObj3(changedCellIds),
      mapToObj(changedValueIds),
    ];
    const finishTransaction = (doRollback) => {
      if (transactions > 0) {
        transactions--;
        if (transactions == 0) {
          transactions = 1;
          callInvalidCellListeners(1);
          if (!collIsEmpty(changedCells)) {
            callTabularListenersForChanges(1);
          }
          callInvalidValueListeners(1);
          if (!collIsEmpty(changedValues)) {
            callValuesListenersForChanges(1);
          }
          if (doRollback?.(store)) {
            collForEach(changedCells, (table, tableId) =>
              collForEach(table, (row, rowId) =>
                collForEach(row, ([oldCell], cellId) =>
                  setOrDelCell(store, tableId, rowId, cellId, oldCell),
                ),
              ),
            );
            collClear(changedCells);
            collForEach(changedValues, ([oldValue], valueId) =>
              setOrDelValue(store, valueId, oldValue),
            );
            collClear(changedValues);
          }
          callListeners(finishTransactionListeners[0], void 0);
          transactions = -1;
          callInvalidCellListeners(0);
          if (!collIsEmpty(changedCells)) {
            callTabularListenersForChanges(0);
          }
          callInvalidValueListeners(0);
          if (!collIsEmpty(changedValues)) {
            callValuesListenersForChanges(0);
          }
          internalListeners[1]?.();
          callListeners(finishTransactionListeners[1], void 0);
          internalListeners[2]?.();
          transactions = 0;
          hadTables = hasTables();
          hadValues = hasValues();
          arrayForEach(
            [
              changedTableIds,
              changedTableCellIds,
              changedRowCount,
              changedRowIds,
              changedCellIds,
              changedCells,
              invalidCells,
              changedValueIds,
              changedValues,
              invalidValues,
            ],
            collClear,
          );
        }
      }
      return store;
    };
    const forEachTable = (tableCallback) =>
      collForEach(tablesMap, (tableMap, tableId) =>
        tableCallback(tableId, (rowCallback) =>
          collForEach(tableMap, (rowMap, rowId) =>
            rowCallback(rowId, (cellCallback) =>
              mapForEach(rowMap, cellCallback),
            ),
          ),
        ),
      );
    const forEachTableCell = (tableId, tableCellCallback) =>
      mapForEach(mapGet(tableCellIds, id(tableId)), tableCellCallback);
    const forEachRow = (tableId, rowCallback) =>
      collForEach(mapGet(tablesMap, id(tableId)), (rowMap, rowId) =>
        rowCallback(rowId, (cellCallback) => mapForEach(rowMap, cellCallback)),
      );
    const forEachCell = (tableId, rowId, cellCallback) =>
      mapForEach(
        mapGet(mapGet(tablesMap, id(tableId)), id(rowId)),
        cellCallback,
      );
    const forEachValue = (valueCallback) =>
      mapForEach(valuesMap, valueCallback);
    const addSortedRowIdsListener = (
      tableId,
      cellId,
      descending,
      offset,
      limit,
      listener,
      mutator,
    ) => {
      let sortedRowIds = getSortedRowIds(
        tableId,
        cellId,
        descending,
        offset,
        limit,
      );
      return addListener(
        () => {
          const newSortedRowIds = getSortedRowIds(
            tableId,
            cellId,
            descending,
            offset,
            limit,
          );
          if (!arrayIsEqual(newSortedRowIds, sortedRowIds)) {
            sortedRowIds = newSortedRowIds;
            listener(
              store,
              tableId,
              cellId,
              descending,
              offset,
              limit,
              sortedRowIds,
            );
          }
        },
        sortedRowIdsListeners[mutator ? 1 : 0],
        [tableId, cellId],
        [getTableIds],
      );
    };
    const addStartTransactionListener = (listener) =>
      addListener(listener, startTransactionListeners);
    const addWillFinishTransactionListener = (listener) =>
      addListener(listener, finishTransactionListeners[0]);
    const addDidFinishTransactionListener = (listener) =>
      addListener(listener, finishTransactionListeners[1]);
    const callListener = (listenerId) => {
      callListenerImpl(listenerId);
      return store;
    };
    const delListener = (listenerId) => {
      delListenerImpl(listenerId);
      return store;
    };
    const getListenerStats = () => ({
      hasTables: pairCollSize2(hasTablesListeners),
      tables: pairCollSize2(tablesListeners),
      tableIds: pairCollSize2(tableIdsListeners),
      hasTable: pairCollSize2(hasTableListeners),
      table: pairCollSize2(tableListeners),
      tableCellIds: pairCollSize2(tableCellIdsListeners),
      hasTableCell: pairCollSize2(hasTableCellListeners, collSize3),
      rowCount: pairCollSize2(rowCountListeners),
      rowIds: pairCollSize2(rowIdsListeners),
      sortedRowIds: pairCollSize2(sortedRowIdsListeners),
      hasRow: pairCollSize2(hasRowListeners, collSize3),
      row: pairCollSize2(rowListeners, collSize3),
      cellIds: pairCollSize2(cellIdsListeners, collSize3),
      hasCell: pairCollSize2(hasCellListeners, collSize4),
      cell: pairCollSize2(cellListeners, collSize4),
      invalidCell: pairCollSize2(invalidCellListeners, collSize4),
      hasValues: pairCollSize2(hasValuesListeners),
      values: pairCollSize2(valuesListeners),
      valueIds: pairCollSize2(valueIdsListeners),
      hasValue: pairCollSize2(hasValueListeners),
      value: pairCollSize2(valueListeners),
      invalidValue: pairCollSize2(invalidValueListeners),
      transaction:
        collSize2(startTransactionListeners) +
        pairCollSize2(finishTransactionListeners),
    });
    const setInternalListeners = (
      preStartTransaction,
      preFinishTransaction,
      postFinishTransaction,
      cellChanged2,
      valueChanged2,
    ) =>
      (internalListeners = [
        preStartTransaction,
        preFinishTransaction,
        postFinishTransaction,
        cellChanged2,
        valueChanged2,
      ]);
    const store = {
      getContent,
      getTables,
      getTableIds,
      getTable,
      getTableCellIds,
      getRowCount,
      getRowIds,
      getSortedRowIds,
      getRow,
      getCellIds,
      getCell,
      getValues,
      getValueIds,
      getValue,
      hasTables,
      hasTable,
      hasTableCell,
      hasRow,
      hasCell,
      hasValues,
      hasValue,
      getTablesJson,
      getValuesJson,
      getJson,
      getTablesSchemaJson,
      getValuesSchemaJson,
      getSchemaJson,
      hasTablesSchema: () => hasTablesSchema,
      hasValuesSchema: () => hasValuesSchema,
      setContent,
      setTables,
      setTable,
      setRow,
      addRow,
      setPartialRow,
      setCell,
      setValues,
      setPartialValues,
      setValue,
      applyChanges,
      setTablesJson,
      setValuesJson,
      setJson,
      setTablesSchema,
      setValuesSchema,
      setSchema,
      delTables,
      delTable,
      delRow,
      delCell,
      delValues,
      delValue,
      delTablesSchema,
      delValuesSchema,
      delSchema,
      transaction,
      startTransaction,
      getTransactionChanges,
      getTransactionLog,
      finishTransaction,
      forEachTable,
      forEachTableCell,
      forEachRow,
      forEachCell,
      forEachValue,
      addSortedRowIdsListener,
      addStartTransactionListener,
      addWillFinishTransactionListener,
      addDidFinishTransactionListener,
      callListener,
      delListener,
      getListenerStats,
      isMergeable: () => false,
      // only used internally by other modules
      createStore,
      addListener,
      callListeners,
      setInternalListeners,
    };
    objMap(
      {
        [HAS + TABLES]: [0, hasTablesListeners, [], () => [hasTables()]],
        [TABLES]: [0, tablesListeners],
        [TABLE_IDS]: [0, tableIdsListeners],
        [HAS + TABLE]: [
          1,
          hasTableListeners,
          [getTableIds],
          (ids) => [hasTable(...ids)],
        ],
        [TABLE]: [1, tableListeners, [getTableIds]],
        [TABLE + CELL_IDS]: [1, tableCellIdsListeners, [getTableIds]],
        [HAS + TABLE + CELL]: [
          2,
          hasTableCellListeners,
          [getTableIds, getTableCellIds],
          (ids) => [hasTableCell(...ids)],
        ],
        [ROW_COUNT]: [1, rowCountListeners, [getTableIds]],
        [ROW_IDS]: [1, rowIdsListeners, [getTableIds]],
        [HAS + ROW]: [
          2,
          hasRowListeners,
          [getTableIds, getRowIds],
          (ids) => [hasRow(...ids)],
        ],
        [ROW]: [2, rowListeners, [getTableIds, getRowIds]],
        [CELL_IDS]: [2, cellIdsListeners, [getTableIds, getRowIds]],
        [HAS + CELL]: [
          3,
          hasCellListeners,
          [getTableIds, getRowIds, getCellIds],
          (ids) => [hasCell(...ids)],
        ],
        [CELL]: [
          3,
          cellListeners,
          [getTableIds, getRowIds, getCellIds],
          (ids) => pairNew(getCell(...ids)),
        ],
        InvalidCell: [3, invalidCellListeners],
        [HAS + VALUES]: [0, hasValuesListeners, [], () => [hasValues()]],
        [VALUES]: [0, valuesListeners],
        [VALUE_IDS]: [0, valueIdsListeners],
        [HAS + VALUE]: [
          1,
          hasValueListeners,
          [getValueIds],
          (ids) => [hasValue(...ids)],
        ],
        [VALUE]: [
          1,
          valueListeners,
          [getValueIds],
          (ids) => pairNew(getValue(ids[0])),
        ],
        InvalidValue: [1, invalidValueListeners],
      },
      (
        [argumentCount, idSetNode, pathGetters, extraArgsGetter],
        listenable,
      ) => {
        store[ADD + listenable + LISTENER] = (...args) =>
          addListener(
            args[argumentCount],
            idSetNode[args[argumentCount + 1] ? 1 : 0],
            argumentCount > 0 ? slice(args, 0, argumentCount) : void 0,
            pathGetters,
            extraArgsGetter,
          );
      },
    );
    return objFreeze(store);
  };

  exports.createStore = createStore;
});
