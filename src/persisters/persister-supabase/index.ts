import type {RealtimeChannel, SupabaseClient} from '@supabase/supabase-js';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  DpcJson,
  PersistedContent,
  PersisterListener,
  Persists,
} from '../../@types/persisters/index.d.ts';
import type {
  SupabasePersister,
  createSupabasePersister as createSupabasePersisterDecl,
} from '../../@types/persisters/persister-supabase/index.d.ts';
import type {Store} from '../../@types/store/index.d.ts';
import {getUniqueId} from '../../common/codec.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json.ts';
import {
  isString,
  isUndefined,
  startInterval,
  stopInterval,
} from '../../common/other.ts';
import {TINYBASE} from '../../common/strings.ts';
import {createCustomPersister} from '../common/create.ts';
import {
  DEFAULT_ROW_ID_COLUMN_NAME,
  SINGLE_ROW_ID,
} from '../common/database/common.ts';

type Persist = Persists.StoreOrMergeableStore;
type ListenerHandle = [
  channel: RealtimeChannel,
  interval: number | NodeJS.Timeout | undefined,
];

const STORE_COLUMN_NAME = 'store';
const PUBLIC_SCHEMA = 'public';

export const createSupabasePersister = ((
  store: Store | MergeableStore,
  supabase: SupabaseClient,
  configOrStoreTableName?: DpcJson | string,
  onIgnoredError?: (error: any) => void,
): SupabasePersister => {
  const config: DpcJson = isString(configOrStoreTableName)
    ? {mode: 'json', storeTableName: configOrStoreTableName}
    : (configOrStoreTableName ?? {mode: 'json'});
  const storeTableName = config.storeTableName ?? TINYBASE;
  const storeIdColumnName =
    config.storeIdColumnName ?? DEFAULT_ROW_ID_COLUMN_NAME;
  const storeColumnName = config.storeColumnName ?? STORE_COLUMN_NAME;
  const {autoLoadIntervalSeconds} = config;

  const getPersisted = async (): Promise<PersistedContent<Persist>> => {
    const {data, error} = await supabase
      .from(storeTableName)
      .select(storeColumnName)
      .eq(storeIdColumnName, SINGLE_ROW_ID)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return jsonParseWithUndefined(
      ((data as any)?.[storeColumnName] as string) ?? 'null',
    );
  };

  const setPersisted = async (
    getContent: () => PersistedContent<Persist>,
  ): Promise<void> => {
    const {error} = await supabase.from(storeTableName).upsert(
      {
        [storeIdColumnName]: SINGLE_ROW_ID,
        [storeColumnName]: jsonStringWithUndefined(getContent() ?? null),
      } as any,
      {onConflict: storeIdColumnName},
    );
    if (error) {
      throw error;
    }
  };

  const addPersisterListener = (
    listener: PersisterListener<Persist>,
  ): ListenerHandle => [
    supabase
      .channel(TINYBASE + '_' + storeTableName + '_' + getUniqueId())
      .on(
        'postgres_changes',
        {event: '*', schema: PUBLIC_SCHEMA, table: storeTableName},
        () => void listener(),
      )
      .subscribe((_status, error) => (error ? onIgnoredError?.(error) : 0)),
    isUndefined(autoLoadIntervalSeconds)
      ? undefined
      : startInterval(() => void listener(), autoLoadIntervalSeconds),
  ];

  const delPersisterListener = async ([
    channel,
    interval,
  ]: ListenerHandle): Promise<void> => {
    stopInterval(interval);
    await supabase.removeChannel(channel);
  };

  return createCustomPersister(
    store,
    getPersisted,
    setPersisted,
    addPersisterListener,
    delPersisterListener,
    onIgnoredError,
    3, // StoreOrMergeableStore,
    {getSupabase: () => supabase},
  ) as SupabasePersister;
}) as typeof createSupabasePersisterDecl;
