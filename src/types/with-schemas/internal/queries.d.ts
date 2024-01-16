import {CellIdFromSchema, TableIdFromSchema} from './store';
import {NoTablesSchema, OptionalTablesSchema} from '../store';
import {Id} from '../common';
import {ResultCell} from '../queries';

export type JoinedCellIdOrId<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  JoinedTableId extends TableIdFromSchema<Schema> | Id =
    | TableIdFromSchema<Schema>
    | Id,
> =
  JoinedTableId extends TableIdFromSchema<Schema>
    ? CellIdFromSchema<Schema, JoinedTableId>
    : Id;

export type GetResultCell = (cellId: Id) => ResultCell;
