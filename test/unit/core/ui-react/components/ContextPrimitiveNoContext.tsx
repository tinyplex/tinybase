import {
  useCheckpointsIds,
  useIndexesIds,
  useMetricsIds,
  usePersisterIds,
  useQueriesIds,
  useRelationshipsIds,
  useStoreIds,
  useSynchronizerIds,
} from 'tinybase/ui-react';

export const ContextPrimitiveNoContext = () => (
  <>
    {JSON.stringify([
      useStoreIds(),
      useMetricsIds(),
      useIndexesIds(),
      useRelationshipsIds(),
      useQueriesIds(),
      useCheckpointsIds(),
      usePersisterIds(),
      useSynchronizerIds(),
    ])}
  </>
);
