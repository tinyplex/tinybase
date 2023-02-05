import {Cell, TablesSchema, Value, ValuesSchema} from '../../store.d';
import {DEFAULT, EMPTY_STRING, TYPE} from '../../common/strings';
import {IdMap, mapEnsure, mapNew} from '../../common/map';
import {LINE, LINE_OR_LINE_TREE, camel, join, snake} from './code';
import {
  REPRESENTS,
  RETURNS_VOID,
  getCallbackDoc,
  getRowTypeDoc,
} from './strings';
import {Id} from '../../common.d';
import {isUndefined} from '../../common/other';
import {objMap} from '../../common/obj';

type TableTypes = [string, string, string, string, string, string];

export const getSchemaFunctions = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  addType: (name: Id, body: LINE, doc: string, react?: 0 | 1) => Id,
  addConstant: (name: Id, body: LINE_OR_LINE_TREE, react?: 0 | 1) => Id,
): [
  <Return>(
    callback: (
      tableId: Id,
      tableTypes: TableTypes,
      tableName: string,
      TABLE_ID: string,
    ) => Return,
  ) => Return[],
  <Return>(
    tableId: Id,
    callback: (
      cellId: Id,
      type: 'string' | 'number' | 'boolean',
      defaultValue: Cell | undefined,
      CELL_ID: string,
      cellName: string,
    ) => Return,
  ) => Return[],
  <Return>(
    callback: (
      valueId: Id,
      type: 'string' | 'number' | 'boolean',
      defaultValue: Value | undefined,
      VALUE_ID: string,
      valueName: string,
    ) => Return,
  ) => Return[],
] => {
  const tableTypes: IdMap<TableTypes> = mapNew();

  const mapTablesSchema = <Return>(
    callback: (
      tableId: Id,
      tableTypes: TableTypes,
      tableName: string,
      TABLE_ID: string,
    ) => Return,
  ) =>
    objMap(tablesSchema, (_, tableId) => {
      return callback(
        tableId,
        mapEnsure(tableTypes, tableId, () => {
          const table = camel(tableId, 1);
          return [
            addType(
              `${table}Table`,
              `{[rowId: Id]: ${table}Row}`,
              `${REPRESENTS} the '${tableId}' Table`,
            ),
            addType(
              `${table}Row`,
              `{${join(
                mapCellSchema(
                  tableId,
                  (cellId, type, defaultValue) =>
                    `'${cellId}'${
                      isUndefined(defaultValue) ? '?' : EMPTY_STRING
                    }: ${type};`,
                ),
                ' ',
              )}}`,
              getRowTypeDoc(tableId),
            ),
            addType(
              `${table}RowWhenSet`,
              `{${join(
                mapCellSchema(
                  tableId,
                  (cellId, type) => `'${cellId}'?: ${type};`,
                ),
                ' ',
              )}}`,
              getRowTypeDoc(tableId, 1),
            ),
            addType(
              `${table}CellId`,
              join(
                mapCellSchema(tableId, (cellId) => `'${cellId}'`),
                ' | ',
              ),
              `A Cell Id for the '${tableId}' Table`,
            ),
            addType(
              `${table}CellCallback`,
              `(...[cellId, cell]: ${join(
                mapCellSchema(
                  tableId,
                  (cellId, type) => `[cellId: '${cellId}', cell: ${type}]`,
                ),
                ' | ',
              )})${RETURNS_VOID}`,
              getCallbackDoc(
                `a Cell Id and value from a Row in the '${tableId}' Table`,
              ),
            ),
            addType(
              `${table}RowCallback`,
              `(rowId: Id, forEachCell: (cellCallback: ${table}CellCallback)` +
                `${RETURNS_VOID})${RETURNS_VOID}`,
              getCallbackDoc(
                `a Row Id from the '${tableId}' Table, and a Cell iterator`,
              ),
            ),
          ];
        }),
        camel(tableId, 1),
        addConstant(snake(tableId), `'${tableId}'`),
      );
    });

  const mapCellSchema = <Return>(
    tableId: Id,
    callback: (
      cellId: Id,
      type: 'string' | 'number' | 'boolean',
      defaultValue: Cell | undefined,
      CELL_ID: string,
      cellName: string,
    ) => Return,
  ) =>
    objMap(tablesSchema[tableId], (cellSchema, cellId) =>
      callback(
        cellId,
        cellSchema[TYPE],
        cellSchema[DEFAULT],
        addConstant(snake(cellId), `'${cellId}'`),
        camel(cellId, 1),
      ),
    );

  const mapValuesSchema = <Return>(
    callback: (
      valueId: Id,
      type: 'string' | 'number' | 'boolean',
      defaultValue: Value | undefined,
      VALUE_ID: string,
      valueName: string,
    ) => Return,
  ) =>
    objMap(valuesSchema, (valueSchema, valueId) =>
      callback(
        valueId,
        valueSchema[TYPE],
        valueSchema[DEFAULT],
        addConstant(snake(valueId), `'${valueId}'`),
        camel(valueId, 1),
      ),
    );

  return [mapTablesSchema, mapCellSchema, mapValuesSchema];
};
