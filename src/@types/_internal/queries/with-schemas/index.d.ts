import type {
  CellIdFromSchema,
  TableIdFromSchema,
} from '../../store/with-schemas';
import type {
  NoTablesSchema,
  OptionalTablesSchema,
} from '../../../store/with-schemas';
import type {Id} from '../../../common/with-schemas';
import type {ResultCell} from '../../../queries/with-schemas';

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
