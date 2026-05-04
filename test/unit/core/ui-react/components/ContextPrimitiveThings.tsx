import type {
  Checkpoints,
  Indexes,
  Metrics,
  Queries,
  Relationships,
  Store,
} from 'tinybase';
import type {AnyPersister} from 'tinybase/persisters';
import type {Synchronizer} from 'tinybase/synchronizers';
import {Provider} from 'tinybase/ui-react';
import {ContextPrimitiveThingsChild} from './ContextPrimitiveThingsChild.tsx';

export interface ContextPrimitiveThingsProps {
  readonly store: Store;
  readonly metrics: Metrics;
  readonly indexes: Indexes;
  readonly relationships: Relationships;
  readonly queries: Queries;
  readonly checkpoints: Checkpoints;
  readonly persister: AnyPersister;
  readonly synchronizer: Synchronizer;
}

export const ContextPrimitiveThings = ({
  store,
  metrics,
  indexes,
  relationships,
  queries,
  checkpoints,
  persister,
  synchronizer,
}: ContextPrimitiveThingsProps) => (
  <Provider
    storesById={{store1: store}}
    metricsById={{metrics1: metrics}}
    indexesById={{indexes1: indexes}}
    relationshipsById={{relationships1: relationships}}
    queriesById={{queries1: queries}}
    checkpointsById={{checkpoints1: checkpoints}}
    persistersById={{persister1: persister}}
    synchronizersById={{synchronizer1: synchronizer}}
  >
    <ContextPrimitiveThingsChild
      store={store}
      metrics={metrics}
      indexes={indexes}
      relationships={relationships}
      queries={queries}
      checkpoints={checkpoints}
      persister={persister}
      synchronizer={synchronizer}
    />
  </Provider>
);
