import type {
  Cell,
  TablesSchema,
  Value,
  ValuesSchema,
} from '../../@types/store/index.d.ts';
import {DEFAULT, TYPE} from '../../common/strings.ts';
import {LINE_OR_LINE_TREE, camel, snake} from './code.ts';
import type {Id} from '../../@types/common/index.d.ts';
import {objToArray} from '../../common/obj.ts';

export type MapTablesSchema = <Return>(
  callback: (tableId: Id, tableName: string, TABLE_ID: string) => Return,
) => Return[];
export type MapCellSchema = <Return>(
  tableId: Id,
  callback: (
    cellId: Id,
    type: 'string' | 'number' | 'boolean',
    defaultValue: Cell | undefined,
    CELL_ID: string,
    cellName: string,
  ) => Return,
) => Return[];
export type MapValuesSchema = <Return>(
  callback: (
    valueId: Id,
    type: 'string' | 'number' | 'boolean',
    defaultValue: Value | undefined,
    VALUE_ID: string,
    valueName: string,
  ) => Return,
) => Return[];

export const getSchemaFunctions = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  addConstant: (name: Id, body: LINE_OR_LINE_TREE, react?: 0 | 1) => Id,
): [MapTablesSchema, MapCellSchema, MapValuesSchema] => {
  const mapTablesSchema = <Return>(
    callback: (tableId: Id, tableName: string, TABLE_ID: string) => Return,
  ) =>
    objToArray(tablesSchema, (_, tableId) => {
      return callback(
        tableId,
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
    objToArray(tablesSchema[tableId], (cellSchema, cellId) =>
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
    objToArray(valuesSchema, (valueSchema, valueId) =>
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
