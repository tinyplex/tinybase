import type {ReactNode} from 'react';
import type {Id} from '../@types/index.js';
import type {
  Provider as ProviderDecl,
  ProviderProps,
} from '../@types/ui-react/index.js';
import {arrayNew, arrayWith} from '../common/array.ts';
import {objDel, objGet, objHas} from '../common/obj.ts';
import {useCallback, useContext, useMemo, useState} from '../common/react.ts';
import {ExtraThingsById, Offsets, mergeParentThings} from './common.tsx';
import {Context, ThingsByOffset} from './context.ts';

export const Provider: typeof ProviderDecl = ({
  store,
  storesById,
  metrics,
  metricsById,
  indexes,
  indexesById,
  relationships,
  relationshipsById,
  queries,
  queriesById,
  checkpoints,
  checkpointsById,
  persister,
  persistersById,
  synchronizer,
  synchronizersById,
  children,
}: ProviderProps & {readonly children: ReactNode}): any => {
  const parentValue = useContext(Context);
  const [extraThingsById, setExtraThingsById] = useState<ExtraThingsById>(
    () => arrayNew(8, () => ({})) as ExtraThingsById,
  );
  const addExtraThingById = useCallback(
    <Offset extends Offsets>(
      thingOffset: Offset,
      id: Id,
      thing: ThingsByOffset[Offset],
    ) =>
      setExtraThingsById((extraThingsById) =>
        objGet(extraThingsById[thingOffset] as any, id) == thing
          ? extraThingsById
          : (arrayWith(extraThingsById, thingOffset, {
              ...extraThingsById[thingOffset],
              [id]: thing,
            } as any) as ExtraThingsById),
      ),
    [],
  );

  const delExtraThingById = useCallback(
    (thingOffset: Offsets, id: Id) =>
      setExtraThingsById((extraThingsById) =>
        !objHas(extraThingsById[thingOffset], id)
          ? extraThingsById
          : (arrayWith(
              extraThingsById,
              thingOffset,
              objDel(extraThingsById[thingOffset] as any, id),
            ) as ExtraThingsById),
      ),
    [],
  );

  return (
    <Context.Provider
      value={useMemo(
        () => [
          ...mergeParentThings(
            Offsets.Store,
            parentValue,
            store,
            storesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Metrics,
            parentValue,
            metrics,
            metricsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Indexes,
            parentValue,
            indexes,
            indexesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Relationships,
            parentValue,
            relationships,
            relationshipsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Queries,
            parentValue,
            queries,
            queriesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Checkpoints,
            parentValue,
            checkpoints,
            checkpointsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Persister,
            parentValue,
            persister,
            persistersById,
            extraThingsById,
          ),
          ...mergeParentThings(
            Offsets.Synchronizer,
            parentValue,
            synchronizer,
            synchronizersById,
            extraThingsById,
          ),
          addExtraThingById,
          delExtraThingById,
        ],
        [
          extraThingsById,
          store,
          storesById,
          metrics,
          metricsById,
          indexes,
          indexesById,
          relationships,
          relationshipsById,
          queries,
          queriesById,
          checkpoints,
          checkpointsById,
          persister,
          persistersById,
          synchronizer,
          synchronizersById,
          parentValue,
          addExtraThingById,
          delExtraThingById,
        ],
      )}
    >
      {children}
    </Context.Provider>
  );
};
