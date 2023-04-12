import {CellIdFromSchema, TableIdFromSchema} from './store';
import {NoTablesSchema, OptionalTablesSchema} from '../store';
import {GetTableCell} from '../queries';
import {Id} from '../common';

export type JoinedCellIdOrId<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  JoinedTableId extends TableIdFromSchema<Schema> | Id =
    | TableIdFromSchema<Schema>
    | Id,
> = JoinedTableId extends TableIdFromSchema<Schema>
  ? CellIdFromSchema<Schema, JoinedTableId>
  : Id;

export type GetTableCellAlias<
  Schema extends OptionalTablesSchema = NoTablesSchema,
  RootTableId extends TableIdFromSchema<Schema> = TableIdFromSchema<Schema>,
> = GetTableCell<Schema, RootTableId>;
