/* @jsxImportSource solid-js */
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
import {Provider} from 'tinybase/ui-solid';
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

export const ContextPrimitiveThings = (props: ContextPrimitiveThingsProps) => (
  <Provider
    storesById={{store1: props.store}}
    metricsById={{metrics1: props.metrics}}
    indexesById={{indexes1: props.indexes}}
    relationshipsById={{relationships1: props.relationships}}
    queriesById={{queries1: props.queries}}
    checkpointsById={{checkpoints1: props.checkpoints}}
    persistersById={{persister1: props.persister}}
    synchronizersById={{synchronizer1: props.synchronizer}}
  >
    <ContextPrimitiveThingsChild
      store={props.store}
      metrics={props.metrics}
      indexes={props.indexes}
      relationships={props.relationships}
      queries={props.queries}
      checkpoints={props.checkpoints}
      persister={props.persister}
      synchronizer={props.synchronizer}
    />
  </Provider>
);
