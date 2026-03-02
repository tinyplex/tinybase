/* @jsxImportSource solid-js */
import type {Accessor, JSXElement} from 'solid-js';
import {createMemo, createSignal, useContext} from 'solid-js';
import type {Id} from '../@types/index.d.ts';
import type {ProviderProps} from '../@types/ui-solid/index.d.ts';
import {arrayNew, arrayWith} from '../common/array.ts';
import {objDel, objGet, objHas} from '../common/obj.ts';
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

const EMPTY_CONTEXT = () => [] as ContextValue;

export const Provider = (
  props: ProviderProps & {readonly children: JSXElement},
): any => {
  const parentValue =
    useContext(Context) ?? (EMPTY_CONTEXT as Accessor<ContextValue>);
  const [extraThingsById, setExtraThingsById] = createSignal<ExtraThingsById>(
    arrayNew(8, () => ({})) as ExtraThingsById,
  );

  const addExtraThingById = <Offset extends Offsets>(
    thingOffset: Offset,
    id: Id,
    thing: ThingsByOffset[Offset],
  ): void => {
    setExtraThingsById((extraThingsById) =>
      objGet(extraThingsById[thingOffset] as any, id) == thing
        ? extraThingsById
        : (arrayWith(extraThingsById, thingOffset, {
            ...extraThingsById[thingOffset],
            [id]: thing,
          } as any) as ExtraThingsById),
    );
  };

  const delExtraThingById = (thingOffset: Offsets, id: Id): void => {
    setExtraThingsById((extraThingsById) =>
      !objHas(extraThingsById[thingOffset], id)
        ? extraThingsById
        : (arrayWith(
            extraThingsById,
            thingOffset,
            objDel(extraThingsById[thingOffset] as any, id),
          ) as ExtraThingsById),
    );
  };

  const contextValue = createMemo<ContextValue>(() => [
    ...mergeParentThings(
      OFFSET_STORE,
      parentValue(),
      props.store,
      props.storesById,
      extraThingsById(),
    ),
    ...mergeParentThings(
      OFFSET_METRICS,
      parentValue(),
      props.metrics,
      props.metricsById,
      extraThingsById(),
    ),
    ...mergeParentThings(
      OFFSET_INDEXES,
      parentValue(),
      props.indexes,
      props.indexesById,
      extraThingsById(),
    ),
    ...mergeParentThings(
      OFFSET_RELATIONSHIPS,
      parentValue(),
      props.relationships,
      props.relationshipsById,
      extraThingsById(),
    ),
    ...mergeParentThings(
      OFFSET_QUERIES,
      parentValue(),
      props.queries,
      props.queriesById,
      extraThingsById(),
    ),
    ...mergeParentThings(
      OFFSET_CHECKPOINTS,
      parentValue(),
      props.checkpoints,
      props.checkpointsById,
      extraThingsById(),
    ),
    ...mergeParentThings(
      OFFSET_PERSISTER,
      parentValue(),
      props.persister,
      props.persistersById,
      extraThingsById(),
    ),
    ...mergeParentThings(
      OFFSET_SYNCHRONIZER,
      parentValue(),
      props.synchronizer,
      props.synchronizersById,
      extraThingsById(),
    ),
    addExtraThingById,
    delExtraThingById,
  ]);

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};
