import type {
  CellIdFromSchema,
  TableIdFromSchema,
} from '../../store/with-schemas/index.d.ts';
import type {
  NoTablesSchema,
  OptionalTablesSchema,
} from '../../../store/with-schemas/index.d.ts';
import type {Id} from '../../../common/with-schemas/index.d.ts';
import type {ResultCell} from '../../../queries/with-schemas/index.d.ts';

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
