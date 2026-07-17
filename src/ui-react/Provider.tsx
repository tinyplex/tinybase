import type {ReactNode} from 'react';
import type {Id} from '../@types/index.d.ts';
import type {
  Provider as ProviderDecl,
  ProviderProps,
} from '../@types/ui-react/index.d.ts';
import {arrayFilter, arrayNew, arrayPush, arrayWith} from '../common/array.ts';
import {IdMap, mapGet, mapNew, mapSet} from '../common/map.ts';
import {objDel, objGet} from '../common/obj.ts';
import {isEmpty, isUndefined, size} from '../common/other.ts';
import {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from '../common/react.ts';
import {ExtraThingsById, ThingsById} from './common/index.tsx';
import {Context, ContextValue, ThingsByOffset} from './context.ts';

export type Offsets =
  | typeof OFFSET_STORE
  | typeof OFFSET_METRICS
  | typeof OFFSET_INDEXES
  | typeof OFFSET_RELATIONSHIPS
  | typeof OFFSET_QUERIES
  | typeof OFFSET_CHECKPOINTS
  | typeof OFFSET_PERSISTER
  | typeof OFFSET_SYNCHRONIZER;

export const OFFSET_STORE = 0;
export const OFFSET_METRICS = 1;
export const OFFSET_INDEXES = 2;
export const OFFSET_RELATIONSHIPS = 3;
export const OFFSET_QUERIES = 4;
export const OFFSET_CHECKPOINTS = 5;
export const OFFSET_PERSISTER = 6;
export const OFFSET_SYNCHRONIZER = 7;

type ThingRegistration = [owner: object, thing: ThingsByOffset[Offsets]];

const mergeParentThings = <Offset extends Offsets>(
  offset: Offset,
  parentValue: ContextValue,
  defaultThing: ThingsByOffset[Offset] | undefined,
  thingsById: ThingsById<ThingsByOffset>[Offset] | undefined,
  extraThingsById: ExtraThingsById,
): [ThingsByOffset[Offset] | undefined, ThingsById<ThingsByOffset>[Offset]] => [
  defaultThing ??
    (parentValue[offset * 2] as ThingsByOffset[Offset] | undefined),
  {
    ...parentValue[offset * 2 + 1],
    ...thingsById,
    ...extraThingsById[offset],
  },
];

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
  const extraThingRegistrations = useRef<IdMap<ThingRegistration[]>[]>(
    arrayNew(8, () => mapNew<Id, ThingRegistration[]>()),
  ).current;
  const setExtraThingById = useCallback(
    <Offset extends Offsets>(
      thingOffset: Offset,
      id: Id,
      thing: ThingsByOffset[Offset] | undefined,
    ) =>
      setExtraThingsById((extraThingsById) =>
        objGet(extraThingsById[thingOffset] as any, id) == thing
          ? extraThingsById
          : (arrayWith(
              extraThingsById,
              thingOffset,
              isUndefined(thing)
                ? objDel({...extraThingsById[thingOffset]} as any, id)
                : {
                    ...extraThingsById[thingOffset],
                    [id]: thing,
                  },
            ) as ExtraThingsById),
      ),
    [],
  );
  const addExtraThingById = useCallback(
    <Offset extends Offsets>(
      thingOffset: Offset,
      id: Id,
      thing: ThingsByOffset[Offset],
      owner: object,
    ) => {
      const registrationsById = extraThingRegistrations[thingOffset];
      const registrations = arrayFilter(
        mapGet(registrationsById, id) ?? [],
        ([registrationOwner]) => registrationOwner != owner,
      );
      arrayPush(registrations, [owner, thing]);
      mapSet(registrationsById, id, registrations);
      setExtraThingById(thingOffset, id, thing);
    },
    [extraThingRegistrations, setExtraThingById],
  );

  const delExtraThingById = useCallback(
    (thingOffset: Offsets, id: Id, owner: object) => {
      const registrationsById = extraThingRegistrations[thingOffset];
      const registrations = arrayFilter(
        mapGet(registrationsById, id) ?? [],
        ([registrationOwner]) => registrationOwner != owner,
      );
      mapSet(
        registrationsById,
        id,
        isEmpty(registrations) ? undefined : registrations,
      );
      setExtraThingById(
        thingOffset,
        id,
        registrations[size(registrations) - 1]?.[1],
      );
    },
    [extraThingRegistrations, setExtraThingById],
  );

  return (
    <Context.Provider
      value={useMemo(
        () => [
          ...mergeParentThings(
            OFFSET_STORE,
            parentValue,
            store,
            storesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            OFFSET_METRICS,
            parentValue,
            metrics,
            metricsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            OFFSET_INDEXES,
            parentValue,
            indexes,
            indexesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            OFFSET_RELATIONSHIPS,
            parentValue,
            relationships,
            relationshipsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            OFFSET_QUERIES,
            parentValue,
            queries,
            queriesById,
            extraThingsById,
          ),
          ...mergeParentThings(
            OFFSET_CHECKPOINTS,
            parentValue,
            checkpoints,
            checkpointsById,
            extraThingsById,
          ),
          ...mergeParentThings(
            OFFSET_PERSISTER,
            parentValue,
            persister,
            persistersById,
            extraThingsById,
          ),
          ...mergeParentThings(
            OFFSET_SYNCHRONIZER,
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
