import {CellIdFromSchema, TableIdFromSchema} from './store.d';
import {NoTablesSchema, OptionalTablesSchema} from '../store.d';
import {Id} from '../common.d';
import {ResultCell} from '../queries.d';

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
