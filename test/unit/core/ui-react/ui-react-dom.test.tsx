/* eslint-disable max-len */
/* eslint-disable react/jsx-no-useless-fragment */

import {
  EditableCellView,
  EditableValueView,
  RelationshipInHtmlTable,
  ResultSortedTableInHtmlTable,
  ResultTableInHtmlTable,
  SliceInHtmlTable,
  SortedTableInHtmlTable,
  SortedTablePaginator,
  TableInHtmlTable,
  ValuesInHtmlTable,
} from 'tinybase/ui-react-dom';
import type {Ids, Indexes, Queries, Relationships, Store} from 'tinybase';
import React, {act} from 'react';
import {
  createIndexes,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
import {fireEvent, render} from '@testing-library/react';
import type {ExtraProps} from 'tinybase/ui-react';

let store: Store;
let indexes: Indexes;
let relationships: Relationships;
let queries: Queries;

const Custom = ({store: _store, queries: _queries, ...props}: ExtraProps) => (
  <b>{JSON.stringify(props)}</b>
);

const getIdsAsProp = (...ids: Ids) => ({...ids});

const nullEvent = () => null;

beforeEach(() => {
  store = createStore()
    .setTables({
      t1: {r1: {c1: 1}},
      t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}},
    })
    .setValues({v1: 1, v2: 2});
  indexes = createIndexes(store).setIndexDefinition('i1', 't2', 'c1');
  relationships = createRelationships(store).setRelationshipDefinition(
    'r1',
    't1',
    't2',
    (getCell) => 'r' + ((getCell('c1') as number) + 1),
  );
  queries = createQueries(store).setQueryDefinition('q1', 't2', ({select}) => {
    select(
      (getTableCell) => '' + getTableCell('c1') + (getTableCell('c2') ?? '_'),
    ).as('c0');
    select('c1');
    select('c2');
  });
});

describe('TableInHtmlTable', () => {
  test('basic', () => {
    const {baseElement} = render(
      <TableInHtmlTable store={store} tableId="t2" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('editable', () => {
    const {baseElement} = render(
      <TableInHtmlTable store={store} tableId="t2" editable={true} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <TableInHtmlTable store={store} tableId="t2" className="table" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('idColumn', () => {
    const {baseElement} = render(
      <TableInHtmlTable store={store} tableId="t2" idColumn={false} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('headerRow', () => {
    const {baseElement} = render(
      <TableInHtmlTable store={store} tableId="t2" headerRow={false} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells array', () => {
    const {baseElement} = render(
      <TableInHtmlTable
        store={store}
        tableId="t2"
        customCells={['c3', 'c2']}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells labels', () => {
    const {baseElement} = render(
      <TableInHtmlTable
        store={store}
        tableId="t2"
        customCells={{c3: 'C3', c2: 'C2'}}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells objects', () => {
    const {baseElement} = render(
      <TableInHtmlTable
        store={store}
        tableId="t2"
        customCells={{
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        }}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('SortedTableInHtmlTable', () => {
  test('basic', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('editable', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        editable={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('paginator, larger', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        paginator={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('paginator, smaller', () => {
    const {baseElement, getAllByRole} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        limit={1}
        paginator={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('paginator, custom', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        limit={1}
        paginator={Custom}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('no sorting specified', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable store={store} tableId="t2" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        className="table"
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('idColumn', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        idColumn={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('headerRow', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        headerRow={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells array', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        customCells={['c3', 'c2']}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells labels', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        customCells={{c3: 'C3', c2: 'C2'}}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells objects', () => {
    const {baseElement} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        customCells={{
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        }}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('sortOnClick', () => {
    const {baseElement, getAllByRole} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        sortOnClick={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[1]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[2]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[2]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[0]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[0]);
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('ValuesInHtmlTable', () => {
  test('basic', () => {
    const {baseElement} = render(<ValuesInHtmlTable store={store} />);
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('editable', () => {
    const {baseElement} = render(
      <ValuesInHtmlTable store={store} editable={true} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('custom', () => {
    const {baseElement} = render(
      <ValuesInHtmlTable
        store={store}
        valueComponent={Custom}
        getValueComponentProps={getIdsAsProp}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <ValuesInHtmlTable store={store} className="values" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('idColumn', () => {
    const {baseElement} = render(
      <ValuesInHtmlTable store={store} idColumn={false} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('SliceInHtmlTable', () => {
  test('basic', () => {
    const {baseElement} = render(
      <SliceInHtmlTable indexes={indexes} indexId="i1" sliceId="2" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('editable', () => {
    const {baseElement} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        editable={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        className="slice"
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('idColumn', () => {
    const {baseElement} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        idColumn={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('headerRow', () => {
    const {baseElement} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        headerRow={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells array', () => {
    const {baseElement} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        customCells={['c3', 'c1']}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells labels', () => {
    const {baseElement} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        customCells={{c3: 'C3', c1: 'C1'}}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells objects', () => {
    const {baseElement} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        customCells={{
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        }}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('RelationshipInHtmlTable', () => {
  test('basic', () => {
    const {baseElement} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('editable', () => {
    const {baseElement} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        editable={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        className="slice"
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('idColumn', () => {
    const {baseElement} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        idColumn={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('headerRow', () => {
    const {baseElement} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        headerRow={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells array', () => {
    const {baseElement} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        customCells={['t1.c1', 't1.c3', 't2.c2', 't2.c1']}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells labels', () => {
    const {baseElement} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        customCells={{
          't1.c1': 'T1C1',
          't1.c3': 'T1C3',
          't2.c2': 'T2C2',
          't2.c1': 'T2C1',
        }}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells objects', () => {
    const {baseElement} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        customCells={{
          't1.c1': {
            label: 'T1C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          't2.c2': {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        }}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('ResultTableInHtmlTable', () => {
  test('basic', () => {
    const {baseElement} = render(
      <ResultTableInHtmlTable queries={queries} queryId="q1" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        className="table"
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('idColumn', () => {
    const {baseElement} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        idColumn={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('headerRow', () => {
    const {baseElement} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        headerRow={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells array', () => {
    const {baseElement} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        customCells={['c3', 'c2']}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells labels', () => {
    const {baseElement} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        customCells={{c3: 'C3', c2: 'C2'}}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells objects', () => {
    const {baseElement} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        customCells={{
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        }}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('ResultSortedTableInHtmlTable', () => {
  test('basic', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('paginator, larger', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        paginator={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('paginator, smaller', () => {
    const {baseElement, getAllByRole} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        limit={1}
        paginator={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('paginator, custom', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        limit={1}
        paginator={Custom}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('no sorting specified', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable queries={queries} queryId="q1" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        className="table"
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('idColumn', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        idColumn={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('headerRow', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        headerRow={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells array', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        customCells={['c3', 'c2']}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells labels', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        customCells={{c3: 'C3', c2: 'C2'}}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('customCells objects', () => {
    const {baseElement} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        customCells={{
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        }}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('sortOnClick', () => {
    const {baseElement, getAllByRole} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        sortOnClick={true}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[1]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[2]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[2]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[0]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[0]);
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('EditableCellView', () => {
  test('basic', () => {
    const {baseElement} = render(
      <EditableCellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <EditableCellView
        store={store}
        tableId="t1"
        rowId="r1"
        cellId="c1"
        className="e"
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('showType', () => {
    const {baseElement} = render(
      <EditableCellView
        store={store}
        tableId="t1"
        rowId="r1"
        cellId="c1"
        showType={false}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('change type and Cell', () => {
    const {baseElement, getAllByRole} = render(
      <EditableCellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
    );
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.change(getAllByRole('spinbutton')[0], {target: {value: '2'}});
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 2}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: true}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();

    fireEvent.click(getAllByRole('checkbox')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: false}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: '1'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.change(getAllByRole('textbox')[0], {target: {value: 'two'}});
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 'two'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 2}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    act(() => store.setCell('t1', 'r1', 'c1', 3));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 3}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    act(() => store.setCell('t1', 'r1', 'c1', true));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: true}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    act(() => store.setCell('t1', 'r1', 'c1', 'three'));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 'three'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('EditableValueView', () => {
  test('basic', () => {
    const {baseElement} = render(
      <EditableValueView store={store} valueId="v1" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('className', () => {
    const {baseElement} = render(
      <EditableValueView valueId="v1" className="e" />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('showType', () => {
    const {baseElement} = render(
      <EditableValueView valueId="v1" showType={false} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('change type and Value', () => {
    const {baseElement, getAllByRole} = render(
      <EditableValueView store={store} valueId="v1" />,
    );
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.change(getAllByRole('spinbutton')[0], {target: {value: 2}});
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 2, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: true, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('checkbox')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: false, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: '1', v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.change(getAllByRole('textbox')[0], {target: {value: 'two'}});
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 'two', v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 2, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    act(() => store.setValue('v1', 3));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 3, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    act(() => store.setValue('v1', true));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: true, v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
    act(() => store.setValue('v1', 'three'));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 'three', v2: 2},
    ]);
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});

describe('SortedTablePaginator', () => {
  test('basic', () => {
    const {baseElement} = render(
      <SortedTablePaginator onChange={nullEvent} total={100} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('limit', () => {
    const {baseElement} = render(
      <SortedTablePaginator onChange={nullEvent} total={100} limit={10} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('limit & offset', () => {
    const {baseElement} = render(
      <SortedTablePaginator
        onChange={nullEvent}
        total={100}
        limit={10}
        offset={5}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('limit larger than size', () => {
    const {baseElement} = render(
      <SortedTablePaginator onChange={nullEvent} total={100} limit={120} />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('offset larger than size', () => {
    const {baseElement} = render(
      <SortedTablePaginator
        onChange={nullEvent}
        total={100}
        offset={120}
        limit={10}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });

  test('offset smaller than 0', () => {
    const {baseElement} = render(
      <SortedTablePaginator
        onChange={nullEvent}
        total={100}
        offset={-20}
        limit={10}
      />,
    );
    expect(baseElement.outerHTML).toMatchSnapshot();
  });
});
