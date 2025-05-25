/// mergeable-store
import type {Id} from '../../../common/with-schemas/index.d.ts';
import type {
  Content,
  NoSchemas,
  NoTablesSchema,
  NoValuesSchema,
  OptionalSchemas,
  OptionalTablesSchema,
  OptionalValuesSchema,
  Store,
  TablesSchema,
  ValuesSchema,
} from '../../../store/with-schemas/index.d.ts';
import type {
  GetNow,
  Mergeable,
  TablesStamp,
  ValuesStamp,
} from '../../with-schemas/index.d.ts';

/// MergeableContent
export type MergeableContent<Schemas extends OptionalSchemas> = [
  mergeableTables: TablesStamp<Schemas[0], true>,
  mergeableValues: ValuesStamp<Schemas[1], true>,
];

/// MergeableChanges
export type MergeableChanges<
  Schemas extends OptionalSchemas,
  Hashed extends boolean = false,
> = [
  mergeableTables: TablesStamp<Schemas[0], Hashed>,
  mergeableValues: ValuesStamp<Schemas[1], Hashed>,
  isChanges: 1,
];

/// MergeableStore
export interface MergeableStore<Schemas extends OptionalSchemas>
  extends Mergeable<Schemas>,
    Store<Schemas> {
  //
  /// MergeableStore.getMergeableContent
  getMergeableContent(): MergeableContent<Schemas>;

  /// MergeableStore.setMergeableContent
  setMergeableContent(
    mergeableContent: MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.setDefaultContent
  setDefaultContent(
    content: Content<Schemas> | (() => Content<Schemas>),
  ): MergeableStore<Schemas>;

  /// MergeableStore.getTransactionMergeableChanges
  getTransactionMergeableChanges(
    withHashes?: boolean,
  ): MergeableChanges<Schemas, true>;

  /// MergeableStore.applyMergeableChanges
  applyMergeableChanges(
    mergeableChanges: MergeableChanges<Schemas> | MergeableContent<Schemas>,
  ): MergeableStore<Schemas>;

  /// MergeableStore.merge
  merge(mergeableStore: MergeableStore<Schemas>): MergeableStore<Schemas>;

  /// Store.isMergeable
  isMergeable(): boolean;

  /// Store.setTablesSchema
  setTablesSchema<TS extends TablesSchema>(
    tablesSchema: TS,
  ): MergeableStore<[typeof tablesSchema, Schemas[1]]>;

  /// Store.setValuesSchema
  setValuesSchema<VS extends ValuesSchema>(
    valuesSchema: VS,
  ): MergeableStore<[Schemas[0], typeof valuesSchema]>;

  /// Store.setSchema
  setSchema<TS extends TablesSchema, VS extends ValuesSchema>(
    tablesSchema: TS,
    valuesSchema?: VS,
  ): MergeableStore<
    [
      typeof tablesSchema,
      Exclude<ValuesSchema, typeof valuesSchema> extends never
        ? NoValuesSchema
        : NonNullable<typeof valuesSchema>,
    ]
  >;

  /// Store.delTablesSchema
  delTablesSchema<
    ValuesSchema extends OptionalValuesSchema = Schemas[1],
  >(): MergeableStore<[NoTablesSchema, ValuesSchema]>;

  /// Store.delValuesSchema
  delValuesSchema<
    TablesSchema extends OptionalTablesSchema = Schemas[0],
  >(): MergeableStore<[TablesSchema, NoValuesSchema]>;

  /// Store.delSchema
  delSchema(): MergeableStore<NoSchemas>;
}

/// createMergeableStore
export function createMergeableStore(
  uniqueId?: Id,
  getNow?: GetNow,
): MergeableStore<NoSchemas>;
