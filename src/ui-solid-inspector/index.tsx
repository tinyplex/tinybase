/* @jsxImportSource solid-js */
/* eslint-disable solid/reactivity */
import type {Accessor, JSXElement} from 'solid-js';
import {ErrorBoundary, createEffect, createSignal, onCleanup} from 'solid-js';
import type {Id} from '../@types/common/index.d.ts';
import type {Store} from '../@types/store/index.d.ts';
import type {CustomCell} from '../@types/ui-solid-dom/index.d.ts';
import type {InspectorProps} from '../@types/ui-solid-inspector/index.d.ts';
import type {
  CellProps,
  RowProps,
  StoreOrStoreId,
  TableProps,
  TablesProps,
  ValueProps,
  ValuesProps,
} from '../@types/ui-solid/index.d.ts';
import {arrayIsEmpty, arrayMap} from '../common/array.ts';
import {
  EDITABLE_CELL,
  INSPECTOR_ERROR_MESSAGE,
  NO_PROVIDED_OBJECTS_MESSAGE,
  OPEN_CELL,
  OPEN_VALUE,
  POSITIONS,
  POSITION_VALUE,
  SORT_CELL,
  STATE_TABLE,
  TITLE,
  UNIQUE_ID,
  getInitialPosition,
  getNewIdFromSuggestedId,
  getUniqueId,
  sortedIdsMap,
} from '../common/inspector/common.ts';
import {
  cancelInspectorIdleCallback,
  requestInspectorIdleCallback,
} from '../common/inspector/idle.ts';
import {APP_STYLESHEET} from '../common/inspector/style.ts';
import type {StoreProp} from '../common/inspector/types.ts';
import {jsonParse, jsonStringWithMap} from '../common/json.ts';
import {objNew} from '../common/obj.ts';
import {isUndefined, mathFloor} from '../common/other.ts';
import {
  DEFAULT,
  EMPTY_STRING,
  TABLE,
  TABLES,
  VALUES,
} from '../common/strings.ts';
import {createSessionPersister} from '../persisters/persister-browser/index.ts';
import {createStore} from '../store/index.ts';
import {
  EditableCellView,
  RelationshipInHtmlTable,
  ResultSortedTableInHtmlTable,
  SliceInHtmlTable,
  SortedTableInHtmlTable,
  ValuesInHtmlTable,
} from '../ui-solid-dom/index.tsx';
import {
  CellView,
  useCell,
  useCreatePersister,
  useCreateStore,
  useDelCellCallback,
  useDelRowCallback,
  useDelTableCallback,
  useDelTablesCallback,
  useDelValueCallback,
  useDelValuesCallback,
  useHasCell,
  useHasTables,
  useHasValues,
  useIndexIds,
  useIndexes,
  useIndexesIds,
  useMetric,
  useMetricIds,
  useMetrics,
  useMetricsIds,
  useQueries,
  useQueriesIds,
  useQueryIds,
  useRelationshipIds,
  useRelationships,
  useRelationshipsIds,
  useSetCellCallback,
  useSetRowCallback,
  useSetTableCallback,
  useSetValueCallback,
  useSliceIds,
  useStore,
  useStoreIds,
  useStoreOrStoreById,
  useTable,
  useTableCellIds,
  useTableIds,
  useValue,
  useValueIds,
  useValues,
} from '../ui-solid/index.ts';

type OnDoneProp = {readonly onDone: () => void};
type ChildrenProp = {readonly children?: JSXElement};

const useEditable = (
  uniqueId: Id,
  s: Store,
): [Accessor<boolean>, (event: MouseEvent) => void] => {
  const storedEditable = useCell(STATE_TABLE, uniqueId, EDITABLE_CELL, s);
  const [editable, setEditable] = createSignal(false);
  createEffect(() => setEditable(!!storedEditable()));
  return [
    editable,
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextEditable = !editable();
      setEditable(nextEditable);
      s.setCell(STATE_TABLE, uniqueId, EDITABLE_CELL, nextEditable);
    },
  ];
};

const useHasTableCallback = (storeOrStoreId: StoreOrStoreId | undefined) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (tableId: Id) => store()?.hasTable(tableId) ?? false;
};

const useHasRowCallback = (
  storeOrStoreId: StoreOrStoreId | undefined,
  tableId: Id,
) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (rowId: Id) => store()?.hasRow(tableId, rowId) ?? false;
};

const useHasValueCallback = (storeOrStoreId: StoreOrStoreId | undefined) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  return (valueId: Id) => store()?.hasValue(valueId) ?? false;
};

const Details = (
  props: {
    readonly uniqueId: Id;
    readonly title: JSXElement;
    readonly editable?: Accessor<boolean>;
    readonly handleEditable?: (event: MouseEvent) => void;
  } & ChildrenProp &
    StoreProp,
) => {
  const open = useCell(STATE_TABLE, props.uniqueId, OPEN_CELL, props.s);
  const handleToggle = (event: Event & {currentTarget: HTMLDetailsElement}) =>
    props.s.setCell(
      STATE_TABLE,
      props.uniqueId,
      OPEN_CELL,
      event.currentTarget.open,
    );
  return (() => (
    <details open={!!open()} onToggle={handleToggle}>
      <summary>
        <span>{props.title}</span>
        {props.handleEditable ? (
          <img
            onClick={props.handleEditable}
            class={
              (() =>
                props.editable?.() ? 'done' : 'edit') as unknown as string
            }
            title={
              (() =>
                props.editable?.()
                  ? 'Done editing'
                  : 'Edit') as unknown as string
            }
          />
        ) : (
          EMPTY_STRING
        )}
      </summary>
      <div>{(() => props.children) as unknown as JSXElement}</div>
    </details>
  )) as unknown as JSXElement;
};

const ConfirmableActions = <
  Props extends TableProps | RowProps | CellProps | ValuesProps | ValueProps,
>(
  props: {
    readonly actions: [
      icon: string,
      title: string,
      component: (props: OnDoneProp & Props) => JSXElement,
    ][];
  } & Props,
) => {
  const [confirming, setConfirming] = createSignal<number>();
  const handleDone = () => setConfirming(undefined);

  createEffect(() => {
    if (!isUndefined(confirming())) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isUndefined(confirming()) && event.key == 'Escape') {
          event.preventDefault();
          handleDone();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
    }
  });

  return (() => {
    const confirmingIndex = confirming();
    const Component = isUndefined(confirmingIndex)
      ? undefined
      : props.actions[confirmingIndex][2];
    return (
      <>
        {Component ? (
          <>
            {Component({...props, onDone: handleDone})}
            <img onClick={handleDone} title="Cancel" class="cancel" />
          </>
        ) : (
          arrayMap(props.actions, ([icon, title], index) => (
            <img
              title={title}
              class={icon}
              onClick={() => setConfirming(index)}
            />
          ))
        )}
      </>
    );
  }) as unknown as JSXElement;
};

const NewId = (
  props: OnDoneProp & {
    readonly suggestedId: Id;
    readonly has: (id: Id) => boolean;
    readonly set: (newId: Id) => void;
    readonly prompt?: string;
  },
) => {
  const [newId, setNewId] = createSignal<Id>(props.suggestedId);
  const [newIdOk, setNewIdOk] = createSignal(true);
  const [previousSuggestedId, setPreviousSuggestedNewId] = createSignal<Id>(
    props.suggestedId,
  );

  const handleNewIdChange = (
    event: Event & {currentTarget: HTMLInputElement},
  ) => {
    const id = event.currentTarget.value;
    setNewId(id);
    setNewIdOk(!props.has(id));
  };
  const handleClick = () => {
    const id = newId();
    if (props.has(id)) {
      setNewIdOk(false);
    } else {
      props.set(id);
      props.onDone();
    }
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key == 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  return (() => {
    if (props.suggestedId != previousSuggestedId()) {
      setNewId(props.suggestedId);
      setPreviousSuggestedNewId(props.suggestedId);
    }
    return (
      <>
        {(props.prompt ?? 'New Id') + ': '}
        <input
          type="text"
          value={newId()}
          onInput={handleNewIdChange}
          onKeyDown={handleKeyDown}
          autofocus
        />{' '}
        <img
          onClick={handleClick}
          title={newIdOk() ? 'Confirm' : 'Id already exists'}
          class={newIdOk() ? 'ok' : 'okDis'}
        />
      </>
    );
  }) as unknown as JSXElement;
};

const Delete = (props: {
  readonly onClick: () => void;
  readonly prompt?: string;
}) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key == 'Enter') {
      event.preventDefault();
      props.onClick();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  onCleanup(() => document.removeEventListener('keydown', handleKeyDown));

  return (
    <>
      {(props.prompt ?? 'Delete') + '? '}
      <img onClick={props.onClick} title="Confirm" class="ok" />
    </>
  );
};

const Actions = (props: {
  readonly left?: JSXElement;
  readonly right?: JSXElement;
}) => (
  <div class="actions">
    <div>{props.left}</div>
    <div>{props.right}</div>
  </div>
);

const AddTable = (props: OnDoneProp & TablesProps) => {
  const has = useHasTableCallback(props.store);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId('table', has),
    has,
    set: useSetTableCallback(
      (newId: Id) => newId,
      () => ({row: {cell: ''}}),
      props.store,
    ),
    prompt: 'Add table',
  });
};

const DeleteTables = (props: OnDoneProp & TablesProps) =>
  Delete({
    onClick: useDelTablesCallback(props.store, props.onDone),
    prompt: 'Delete all tables',
  });

const TablesActions = (props: TablesProps) =>
  Actions({
    left: ConfirmableActions({
      actions: [['add', 'Add table', AddTable]],
      store: props.store,
    }),
    right: useHasTables(props.store)()
      ? ConfirmableActions({
          actions: [['delete', 'Delete all tables', DeleteTables]],
          store: props.store,
        })
      : EMPTY_STRING,
  });

const AddRow = (props: OnDoneProp & TableProps) => {
  const has = useHasRowCallback(props.store, props.tableId);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId('row', has),
    has,
    set: useSetRowCallback(
      props.tableId,
      (newId) => newId,
      (_, store) =>
        objNew(
          arrayMap(store.getTableCellIds(props.tableId), (cellId) => [
            cellId,
            '',
          ]),
        ),
    ),
    prompt: 'Add row',
  });
};

const CloneTable = (props: OnDoneProp & TableProps) => {
  const store = useStoreOrStoreById(props.store)();
  const has = useHasTableCallback(store);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId(props.tableId, has),
    has,
    set: useSetTableCallback(
      (tableId) => tableId,
      (_, store) => store.getTable(props.tableId),
      store,
    ),
    prompt: 'Clone table to',
  });
};

const DeleteTable = (props: OnDoneProp & TableProps) =>
  Delete({
    onClick: useDelTableCallback(props.tableId, props.store, props.onDone),
    prompt: 'Delete table',
  });

const TableActions1 = (props: TableProps) =>
  ConfirmableActions({
    actions: [['add', 'Add row', AddRow]],
    store: props.store,
    tableId: props.tableId,
  });

const TableActions2 = (props: TableProps) =>
  ConfirmableActions({
    actions: [
      ['clone', 'Clone table', CloneTable],
      ['delete', 'Delete table', DeleteTable],
    ],
    store: props.store,
    tableId: props.tableId,
  });

const AddCell = (props: OnDoneProp & RowProps) => {
  const store = useStoreOrStoreById(props.store)();
  const has = (cellId: Id) =>
    store?.hasCell(props.tableId, props.rowId, cellId) ?? false;
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId('cell', has),
    has,
    set: useSetCellCallback(
      props.tableId,
      props.rowId,
      (newId: Id) => newId,
      () => '',
      store,
    ),
    prompt: 'Add cell',
  });
};

const CloneRow = (props: OnDoneProp & RowProps) => {
  const store = useStoreOrStoreById(props.store)();
  const has = useHasRowCallback(store, props.tableId);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId(props.rowId, has),
    has,
    set: useSetRowCallback(
      props.tableId,
      (newId) => newId,
      (_, store) => store.getRow(props.tableId, props.rowId),
      store,
    ),
    prompt: 'Clone row to',
  });
};

const DeleteRow = (props: OnDoneProp & RowProps) =>
  Delete({
    onClick: useDelRowCallback(
      props.tableId,
      props.rowId,
      props.store,
      props.onDone,
    ),
    prompt: 'Delete row',
  });

const RowActions = (props: RowProps) =>
  ConfirmableActions({
    actions: [
      ['add', 'Add cell', AddCell],
      ['clone', 'Clone row', CloneRow],
      ['delete', 'Delete row', DeleteRow],
    ],
    store: props.store,
    tableId: props.tableId,
    rowId: props.rowId,
  });

const CellDelete = (props: OnDoneProp & CellProps) =>
  Delete({
    onClick: useDelCellCallback(
      props.tableId,
      props.rowId,
      props.cellId,
      true,
      props.store,
      props.onDone,
    ),
    prompt: 'Delete cell',
  });

const CellActions = (props: CellProps) =>
  ConfirmableActions({
    actions: [['delete', 'Delete cell', CellDelete]],
    store: props.store,
    tableId: props.tableId,
    rowId: props.rowId,
    cellId: props.cellId,
  });

const AddValue = (props: OnDoneProp & ValuesProps) => {
  const has = useHasValueCallback(props.store);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId('value', has),
    has,
    set: useSetValueCallback(
      (newId: Id) => newId,
      () => '',
      props.store,
    ),
    prompt: 'Add value',
  });
};

const DeleteValues = (props: OnDoneProp & ValuesProps) =>
  Delete({
    onClick: useDelValuesCallback(props.store, props.onDone),
    prompt: 'Delete all values',
  });

const ValuesActions = (props: ValuesProps) =>
  Actions({
    left: ConfirmableActions({
      actions: [['add', 'Add value', AddValue]],
      store: props.store,
    }),
    right: useHasValues(props.store)()
      ? ConfirmableActions({
          actions: [['delete', 'Delete all values', DeleteValues]],
          store: props.store,
        })
      : EMPTY_STRING,
  });

const CloneValue = (props: OnDoneProp & ValueProps) => {
  const has = useHasValueCallback(props.store);
  return NewId({
    onDone: props.onDone,
    suggestedId: getNewIdFromSuggestedId(props.valueId, has),
    has,
    set: useSetValueCallback(
      (newId: Id) => newId,
      (_, store) => store.getValue(props.valueId) ?? '',
      props.store,
    ),
    prompt: 'Clone value to',
  });
};

const DeleteValue = (props: OnDoneProp & ValueProps) =>
  Delete({
    onClick: useDelValueCallback(props.valueId, props.store, props.onDone),
    prompt: 'Delete value',
  });

const ValueActions = (props: ValueProps) =>
  ConfirmableActions({
    actions: [
      ['clone', 'Clone value', CloneValue],
      ['delete', 'Delete value', DeleteValue],
    ],
    store: props.store,
    valueId: props.valueId,
  });

const valueActions = [{label: '', component: ValueActions}];
const rowActions = [{label: '', component: RowActions}];

const EditableCellViewWithActions = (props: CellProps) => (
  <>
    <EditableCellView {...props} />
    {useHasCell(props.tableId, props.rowId, props.cellId, props.store)() ? (
      <CellActions {...props} />
    ) : (
      EMPTY_STRING
    )}
  </>
);

const ValuesView = (
  props: ValuesProps & {readonly storeId?: Id} & StoreProp,
) => {
  const uniqueId = getUniqueId('v', props.storeId);
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  const valueIds = useValueIds(props.store);
  return Details({
    uniqueId,
    title: VALUES,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      return (
        <>
          {arrayIsEmpty(valueIds()) ? (
            <p>No values.</p>
          ) : (
            <ValuesInHtmlTable
              store={props.store}
              editable={editable()}
              extraCellsAfter={
                (() => (editable() ? valueActions : [])) as unknown as []
              }
            />
          )}
          {editable() ? <ValuesActions store={props.store} /> : EMPTY_STRING}
        </>
      );
    },
  });
};

const TableView = (props: TableProps & {readonly storeId?: Id} & StoreProp) => {
  const uniqueId = getUniqueId('t', props.storeId, props.tableId);
  const sort = useCell(STATE_TABLE, uniqueId, SORT_CELL, props.s);
  const handleChange = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    SORT_CELL,
    jsonStringWithMap,
    props.s,
  );
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  const cellIds = useTableCellIds(props.tableId, props.store);
  return Details({
    uniqueId,
    title: TABLE + ': ' + props.tableId,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      const [cellId, descending, offset] = jsonParse(
        (sort() as string) ?? '[]',
      );
      return (
        <>
          <SortedTableInHtmlTable
            tableId={props.tableId}
            store={props.store}
            cellId={cellId}
            descending={descending}
            offset={offset}
            limit={10}
            paginator={true}
            sortOnClick={true}
            onChange={handleChange}
            editable={editable()}
            extraCellsAfter={
              (() => (editable() ? rowActions : [])) as unknown as []
            }
            customCells={
              (() => {
                const CellComponent = editable()
                  ? EditableCellViewWithActions
                  : CellView;
                return objNew(
                  arrayMap(cellIds(), (cellId) => [
                    cellId,
                    {label: cellId, component: CellComponent},
                  ]),
                );
              }) as unknown as {[cellId: Id]: CustomCell}
            }
          />
          {editable() ? (
            <div class="actions">
              <div>
                <TableActions1 tableId={props.tableId} store={props.store} />
              </div>
              <div>
                <TableActions2 tableId={props.tableId} store={props.store} />
              </div>
            </div>
          ) : (
            EMPTY_STRING
          )}
        </>
      );
    },
  });
};

const TablesView = (
  props: TablesProps & {readonly storeId?: Id} & StoreProp,
) => {
  const uniqueId = getUniqueId('ts', props.storeId);
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  const tableIds = useTableIds(props.store);
  return Details({
    uniqueId,
    title: TABLES,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      return (
        <>
          {arrayIsEmpty(tableIds()) ? (
            <p>No tables.</p>
          ) : (
            sortedIdsMap(tableIds(), (tableId) => (
              <TableView
                store={props.store}
                storeId={props.storeId}
                tableId={tableId}
                s={props.s}
              />
            ))
          )}
          {editable() ? <TablesActions store={props.store} /> : EMPTY_STRING}
        </>
      );
    },
  });
};

const StoreView = (props: {readonly storeId?: Id} & StoreProp) => {
  const store = useStore(props.storeId);
  return (() =>
    isUndefined(store()) ? (
      EMPTY_STRING
    ) : (
      <Details
        uniqueId={getUniqueId('s', props.storeId)}
        title={
          (store()!.isMergeable() ? 'Mergeable' : '') +
          'Store: ' +
          (props.storeId ?? DEFAULT)
        }
        s={props.s}
      >
        <ValuesView storeId={props.storeId} store={store()} s={props.s} />
        <TablesView storeId={props.storeId} store={store()} s={props.s} />
      </Details>
    )) as unknown as JSXElement;
};

const MetricRow = (props: {readonly metrics: any; readonly metricId: Id}) => (
  <tr>
    <th title={props.metricId}>{props.metricId}</th>
    <td>{props.metrics?.getTableId(props.metricId)}</td>
    <td>{useMetric(props.metricId, props.metrics)()}</td>
  </tr>
);

const MetricsView = (props: {readonly metricsId?: Id} & StoreProp) => {
  const metrics = useMetrics(props.metricsId);
  const metricIds = useMetricIds(metrics);
  return (() =>
    isUndefined(metrics()) ? (
      EMPTY_STRING
    ) : (
      <Details
        uniqueId={getUniqueId('m', props.metricsId)}
        title={'Metrics: ' + (props.metricsId ?? DEFAULT)}
        s={props.s}
      >
        {arrayIsEmpty(metricIds()) ? (
          'No metrics defined'
        ) : (
          <table>
            <thead>
              <tr>
                <th>Metric Id</th>
                <th>Table Id</th>
                <th>Metric</th>
              </tr>
            </thead>
            <tbody>
              {arrayMap(metricIds(), (metricId) => (
                <MetricRow metrics={metrics()} metricId={metricId} />
              ))}
            </tbody>
          </table>
        )}
      </Details>
    )) as unknown as JSXElement;
};

const SliceView = (
  props: {
    readonly indexes: any;
    readonly indexesId?: Id;
    readonly indexId: Id;
    readonly sliceId: Id;
  } & StoreProp,
) => {
  const uniqueId = getUniqueId(
    'i',
    props.indexesId,
    props.indexId,
    props.sliceId,
  );
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  return Details({
    uniqueId,
    title: 'Slice: ' + props.sliceId,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      return (
        <SliceInHtmlTable
          sliceId={props.sliceId}
          indexId={props.indexId}
          indexes={props.indexes}
          editable={editable()}
        />
      );
    },
  });
};

const IndexView = (
  props: {
    readonly indexes: any;
    readonly indexesId?: Id;
    readonly indexId: Id;
  } & StoreProp,
) => (
  <Details
    uniqueId={getUniqueId('i', props.indexesId, props.indexId)}
    title={'Index: ' + props.indexId}
    s={props.s}
  >
    {arrayMap(useSliceIds(props.indexId, props.indexes)(), (sliceId) => (
      <SliceView
        indexes={props.indexes}
        indexesId={props.indexesId}
        indexId={props.indexId}
        sliceId={sliceId}
        s={props.s}
      />
    ))}
  </Details>
);

const IndexesView = (props: {readonly indexesId?: Id} & StoreProp) => {
  const indexes = useIndexes(props.indexesId);
  const indexIds = useIndexIds(indexes);
  return (() =>
    isUndefined(indexes()) ? (
      EMPTY_STRING
    ) : (
      <Details
        uniqueId={getUniqueId('i', props.indexesId)}
        title={'Indexes: ' + (props.indexesId ?? DEFAULT)}
        s={props.s}
      >
        {arrayIsEmpty(indexIds())
          ? 'No indexes defined'
          : sortedIdsMap(indexIds(), (indexId) => (
              <IndexView
                indexes={indexes()}
                indexesId={props.indexesId}
                indexId={indexId}
                s={props.s}
              />
            ))}
      </Details>
    )) as unknown as JSXElement;
};

const QueryView = (
  props: {
    readonly queries: any;
    readonly queriesId?: Id;
    readonly queryId: Id;
  } & StoreProp,
) => {
  const uniqueId = getUniqueId('q', props.queriesId, props.queryId);
  const sort = useCell(STATE_TABLE, uniqueId, SORT_CELL, props.s);
  const handleChange = useSetCellCallback(
    STATE_TABLE,
    uniqueId,
    SORT_CELL,
    jsonStringWithMap,
    props.s,
  );
  return (() => {
    const [cellId, descending, offset] = jsonParse((sort() as string) ?? '[]');
    return (
      <Details
        uniqueId={uniqueId}
        title={'Query: ' + props.queryId}
        s={props.s}
      >
        <ResultSortedTableInHtmlTable
          queryId={props.queryId}
          queries={props.queries}
          cellId={cellId}
          descending={descending}
          offset={offset}
          limit={10}
          paginator={true}
          sortOnClick={true}
          onChange={handleChange}
        />
      </Details>
    );
  }) as unknown as JSXElement;
};

const QueriesView = (props: {readonly queriesId?: Id} & StoreProp) => {
  const queries = useQueries(props.queriesId);
  const queryIds = useQueryIds(queries);
  return (() =>
    isUndefined(queries()) ? (
      EMPTY_STRING
    ) : (
      <Details
        uniqueId={getUniqueId('q', props.queriesId)}
        title={'Queries: ' + (props.queriesId ?? DEFAULT)}
        s={props.s}
      >
        {arrayIsEmpty(queryIds())
          ? 'No queries defined'
          : sortedIdsMap(queryIds(), (queryId) => (
              <QueryView
                queries={queries()}
                queriesId={props.queriesId}
                queryId={queryId}
                s={props.s}
              />
            ))}
      </Details>
    )) as unknown as JSXElement;
};

const RelationshipView = (
  props: {
    readonly relationships: any;
    readonly relationshipsId?: Id;
    readonly relationshipId: Id;
  } & StoreProp,
) => {
  const uniqueId = getUniqueId(
    'r',
    props.relationshipsId,
    props.relationshipId,
  );
  const [editable, handleEditable] = useEditable(uniqueId, props.s);
  return Details({
    uniqueId,
    title: 'Relationship: ' + props.relationshipId,
    editable,
    handleEditable,
    s: props.s,
    get children() {
      return (
        <RelationshipInHtmlTable
          relationshipId={props.relationshipId}
          relationships={props.relationships}
          editable={editable()}
        />
      );
    },
  });
};

const RelationshipsView = (
  props: {readonly relationshipsId?: Id} & StoreProp,
) => {
  const relationships = useRelationships(props.relationshipsId);
  const relationshipIds = useRelationshipIds(relationships);
  return (() =>
    isUndefined(relationships()) ? (
      EMPTY_STRING
    ) : (
      <Details
        uniqueId={getUniqueId('r', props.relationshipsId)}
        title={'Relationships: ' + (props.relationshipsId ?? DEFAULT)}
        s={props.s}
      >
        {arrayIsEmpty(relationshipIds())
          ? 'No relationships defined'
          : sortedIdsMap(relationshipIds(), (relationshipId) => (
              <RelationshipView
                relationships={relationships()}
                relationshipsId={props.relationshipsId}
                relationshipId={relationshipId}
                s={props.s}
              />
            ))}
      </Details>
    )) as unknown as JSXElement;
};

const Header = (props: StoreProp) => {
  const position = useValue(POSITION_VALUE, props.s);
  const handleClick = () => open('https://tinybase.org', '_blank');
  const handleClose = () => props.s.setValue(OPEN_VALUE, false);
  const handleDock = (event: MouseEvent & {currentTarget: HTMLImageElement}) =>
    props.s.setValue(POSITION_VALUE, Number(event.currentTarget.dataset.id));

  return (
    <header>
      <img class="flat" title={TITLE} onClick={handleClick} />
      <span>{TITLE}</span>
      {arrayMap(POSITIONS, (name, p) =>
        p == (position() ?? 1) ? (
          EMPTY_STRING
        ) : (
          <img onClick={handleDock} data-id={p} title={'Dock to ' + name} />
        ),
      )}
      <img class="flat" onClick={handleClose} title="Close" />
    </header>
  );
};

const Nub = ({s}: StoreProp) => {
  const position = useValue(POSITION_VALUE, s);
  const open = useValue(OPEN_VALUE, s);
  const handleOpen = () => s.setValue(OPEN_VALUE, true);
  return (() =>
    open() ? (
      EMPTY_STRING
    ) : (
      <img onClick={handleOpen} title={TITLE} data-position={position() ?? 1} />
    )) as unknown as JSXElement;
};

const Body = ({s}: StoreProp) => {
  let article: HTMLElement | undefined;
  let idleCallback = 0;
  const [scrolled, setScrolled] = createSignal(false);
  const state = useTable(STATE_TABLE, s);
  const scrollValues = useValues(s);

  createEffect(() => {
    const {scrollLeft, scrollTop} = scrollValues();
    if (article && !scrolled()) {
      const observer = new MutationObserver(() => {
        if (
          article &&
          article.scrollWidth >=
            mathFloor(scrollLeft as number) + article.clientWidth &&
          article.scrollHeight >=
            mathFloor(scrollTop as number) + article.clientHeight
        ) {
          article.scrollTo(scrollLeft as number, scrollTop as number);
        }
      });
      observer.observe(article, {childList: true, subtree: true});
      onCleanup(() => observer.disconnect());
    }
  });

  const handleScroll = (event: Event & {currentTarget: HTMLElement}) => {
    const {scrollLeft, scrollTop} = event.currentTarget;
    cancelInspectorIdleCallback(idleCallback);
    idleCallback = requestInspectorIdleCallback(() => {
      setScrolled(true);
      s.setPartialValues({scrollLeft, scrollTop});
    });
  };

  const store = useStore();
  const storeIds = useStoreIds();
  const metrics = useMetrics();
  const metricsIds = useMetricsIds();
  const indexes = useIndexes();
  const indexesIds = useIndexesIds();
  const relationships = useRelationships();
  const relationshipsIds = useRelationshipsIds();
  const queries = useQueries();
  const queriesIds = useQueriesIds();

  return (() => {
    state();
    return (
      <>
        {isUndefined(store()) &&
        arrayIsEmpty(storeIds()) &&
        isUndefined(metrics()) &&
        arrayIsEmpty(metricsIds()) &&
        isUndefined(indexes()) &&
        arrayIsEmpty(indexesIds()) &&
        isUndefined(relationships()) &&
        arrayIsEmpty(relationshipsIds()) &&
        isUndefined(queries()) &&
        arrayIsEmpty(queriesIds()) ? (
          <span class="warn">{NO_PROVIDED_OBJECTS_MESSAGE}</span>
        ) : (
          <article ref={article} onScroll={handleScroll}>
            <StoreView s={s} />
            {arrayMap(storeIds(), (storeId) => (
              <StoreView storeId={storeId} s={s} />
            ))}
            <MetricsView s={s} />
            {arrayMap(metricsIds(), (metricsId) => (
              <MetricsView metricsId={metricsId} s={s} />
            ))}
            <IndexesView s={s} />
            {arrayMap(indexesIds(), (indexesId) => (
              <IndexesView indexesId={indexesId} s={s} />
            ))}
            <RelationshipsView s={s} />
            {arrayMap(relationshipsIds(), (relationshipsId) => (
              <RelationshipsView relationshipsId={relationshipsId} s={s} />
            ))}
            <QueriesView s={s} />
            {arrayMap(queriesIds(), (queriesId) => (
              <QueriesView queriesId={queriesId} s={s} />
            ))}
          </article>
        )}
      </>
    );
  }) as unknown as JSXElement;
};

const Panel = ({s}: StoreProp) => {
  const position = useValue(POSITION_VALUE, s);
  const open = useValue(OPEN_VALUE, s);
  return (() =>
    open() ? (
      <main data-position={position() ?? 1}>
        <Header s={s} />
        <ErrorBoundary
          fallback={<span class="warn">{INSPECTOR_ERROR_MESSAGE}</span>}
        >
          <Body s={s} />
        </ErrorBoundary>
      </main>
    ) : (
      EMPTY_STRING
    )) as unknown as JSXElement;
};

export const Inspector = (props: InspectorProps) => {
  const position = props.position ?? 'right';
  const open = props.open ?? false;
  const values = {
    position: getInitialPosition(position),
    open: !!open,
  };
  const s = useCreateStore(createStore);
  const [ready, setReady] = createSignal(false);

  useCreatePersister(
    s,
    (s) => createSessionPersister(s, UNIQUE_ID),
    async (persister) => {
      await persister.load([{}, values]);
      await persister.startAutoSave();
      setReady(true);
    },
    (persister) => persister.destroy(),
  );

  return (() => (
    <>
      {
        (() =>
          ready() ? (
            <aside id={UNIQUE_ID} style={{'--hue': props.hue ?? 270}}>
              <Nub s={s()} />
              <Panel s={s()} />
            </aside>
          ) : (
            EMPTY_STRING
          )) as unknown as JSXElement
      }
      <style>{APP_STYLESHEET}</style>
    </>
  )) as unknown as JSXElement;
};
