import {Cell, TablesSchema, Value, ValuesSchema} from '../../store.d';
import {DEFAULT, TYPE} from '../../common/strings';
import {LINE_OR_LINE_TREE, camel, snake} from './code';
import {Id} from '../../common.d';
import {objMap} from '../../common/obj';

export const getSchemaFunctions = (
  tablesSchema: TablesSchema,
  valuesSchema: ValuesSchema,
  addConstant: (name: Id, body: LINE_OR_LINE_TREE, react?: 0 | 1) => Id,
): [
  <Return>(
    callback: (tableId: Id, tableName: string, TABLE_ID: string) => Return,
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
  const mapTablesSchema = <Return>(
    callback: (tableId: Id, tableName: string, TABLE_ID: string) => Return,
  ) =>
    objMap(tablesSchema, (_, tableId) => {
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
