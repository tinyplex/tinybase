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
    const {container, unmount} = render(
      <TableInHtmlTable store={store} tableId="t2" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('editable', () => {
    const {container, unmount} = render(
      <TableInHtmlTable store={store} tableId="t2" editable={true} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <TableInHtmlTable store={store} tableId="t2" className="table" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('idColumn', () => {
    const {container, unmount} = render(
      <TableInHtmlTable store={store} tableId="t2" idColumn={false} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('headerRow', () => {
    const {container, unmount} = render(
      <TableInHtmlTable store={store} tableId="t2" headerRow={false} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells array', () => {
    const {container, unmount} = render(
      <TableInHtmlTable
        store={store}
        tableId="t2"
        customCells={['c3', 'c2']}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells labels', () => {
    const {container, unmount} = render(
      <TableInHtmlTable
        store={store}
        tableId="t2"
        customCells={{c3: 'C3', c2: 'C2'}}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells objects', () => {
    const {container, unmount} = render(
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
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('SortedTableInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('editable', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        editable={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('paginator, larger', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        paginator={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('paginator, smaller', () => {
    const {container, getAllByRole, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        limit={1}
        paginator={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('paginator, custom', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        limit={1}
        paginator={Custom}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('no sorting specified', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable store={store} tableId="t2" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        className="table"
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('idColumn', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        idColumn={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('headerRow', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        headerRow={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells array', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        customCells={['c3', 'c2']}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells labels', () => {
    const {container, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        customCells={{c3: 'C3', c2: 'C2'}}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells objects', () => {
    const {container, unmount} = render(
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
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('sortOnClick', () => {
    const {container, getAllByRole, unmount} = render(
      <SortedTableInHtmlTable
        store={store}
        tableId="t2"
        cellId="c1"
        descending={true}
        sortOnClick={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[1]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[2]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[2]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[0]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[0]);
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('ValuesInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(<ValuesInHtmlTable store={store} />);
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('editable', () => {
    const {container, unmount} = render(
      <ValuesInHtmlTable store={store} editable={true} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('custom', () => {
    const {container, unmount} = render(
      <ValuesInHtmlTable
        store={store}
        valueComponent={Custom}
        getValueComponentProps={getIdsAsProp}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <ValuesInHtmlTable store={store} className="values" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('idColumn', () => {
    const {container, unmount} = render(
      <ValuesInHtmlTable store={store} idColumn={false} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('SliceInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(
      <SliceInHtmlTable indexes={indexes} indexId="i1" sliceId="2" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('editable', () => {
    const {container, unmount} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        editable={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        className="slice"
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('idColumn', () => {
    const {container, unmount} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        idColumn={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('headerRow', () => {
    const {container, unmount} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        headerRow={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells array', () => {
    const {container, unmount} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        customCells={['c3', 'c1']}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells labels', () => {
    const {container, unmount} = render(
      <SliceInHtmlTable
        indexes={indexes}
        indexId="i1"
        sliceId="2"
        customCells={{c3: 'C3', c1: 'C1'}}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells objects', () => {
    const {container, unmount} = render(
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
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('RelationshipInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('editable', () => {
    const {container, unmount} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        editable={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        className="slice"
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('idColumn', () => {
    const {container, unmount} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        idColumn={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('headerRow', () => {
    const {container, unmount} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        headerRow={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells array', () => {
    const {container, unmount} = render(
      <RelationshipInHtmlTable
        relationships={relationships}
        relationshipId="r1"
        customCells={['t1.c1', 't1.c3', 't2.c2', 't2.c1']}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells labels', () => {
    const {container, unmount} = render(
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
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells objects', () => {
    const {container, unmount} = render(
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
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('ResultTableInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(
      <ResultTableInHtmlTable queries={queries} queryId="q1" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        className="table"
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('idColumn', () => {
    const {container, unmount} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        idColumn={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('headerRow', () => {
    const {container, unmount} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        headerRow={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells array', () => {
    const {container, unmount} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        customCells={['c3', 'c2']}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells labels', () => {
    const {container, unmount} = render(
      <ResultTableInHtmlTable
        queries={queries}
        queryId="q1"
        customCells={{c3: 'C3', c2: 'C2'}}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells objects', () => {
    const {container, unmount} = render(
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
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('ResultSortedTableInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('paginator, larger', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        paginator={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('paginator, smaller', () => {
    const {container, getAllByRole, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        limit={1}
        paginator={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('paginator, custom', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        limit={1}
        paginator={Custom}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('no sorting specified', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable queries={queries} queryId="q1" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        className="table"
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('idColumn', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        idColumn={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('headerRow', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        headerRow={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells array', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        customCells={['c3', 'c2']}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells labels', () => {
    const {container, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        customCells={{c3: 'C3', c2: 'C2'}}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('customCells objects', () => {
    const {container, unmount} = render(
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
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('sortOnClick', () => {
    const {container, getAllByRole, unmount} = render(
      <ResultSortedTableInHtmlTable
        queries={queries}
        queryId="q1"
        cellId="c1"
        descending={true}
        sortOnClick={true}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[1]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[2]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[2]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[0]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('columnheader')[0]);
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('EditableCellView', () => {
  test('basic', () => {
    const {container, unmount} = render(
      <EditableCellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <EditableCellView
        store={store}
        tableId="t1"
        rowId="r1"
        cellId="c1"
        className="e"
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('showType', () => {
    const {container, unmount} = render(
      <EditableCellView
        store={store}
        tableId="t1"
        rowId="r1"
        cellId="c1"
        showType={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('change type and Cell', () => {
    const {container, getAllByRole, unmount} = render(
      <EditableCellView store={store} tableId="t1" rowId="r1" cellId="c1" />,
    );
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.change(getAllByRole('spinbutton')[0], {target: {value: '2'}});
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 2}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: true}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();

    fireEvent.click(getAllByRole('checkbox')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: false}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: '1'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.change(getAllByRole('textbox')[0], {target: {value: 'two'}});
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 'two'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 2}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    act(() => store.setCell('t1', 'r1', 'c1', 3));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 3}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    act(() => store.setCell('t1', 'r1', 'c1', true));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: true}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    act(() => store.setCell('t1', 'r1', 'c1', 'three'));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 'three'}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('EditableValueView', () => {
  test('basic', () => {
    const {container, unmount} = render(
      <EditableValueView store={store} valueId="v1" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('className', () => {
    const {container, unmount} = render(
      <EditableValueView valueId="v1" className="e" />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('showType', () => {
    const {container, unmount} = render(
      <EditableValueView valueId="v1" showType={false} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('change type and Value', () => {
    const {container, getAllByRole, unmount} = render(
      <EditableValueView store={store} valueId="v1" />,
    );
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 1, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.change(getAllByRole('spinbutton')[0], {target: {value: 2}});
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 2, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: true, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('checkbox')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: false, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: '1', v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.change(getAllByRole('textbox')[0], {target: {value: 'two'}});
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 'two', v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    fireEvent.click(getAllByRole('button')[0]);
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 2, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    act(() => store.setValue('v1', 3));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 3, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    act(() => store.setValue('v1', true));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: true, v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();
    act(() => store.setValue('v1', 'three'));
    expect(store.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 2}, r2: {c1: 3, c2: 4}}},
      {v1: 'three', v2: 2},
    ]);
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});

describe('SortedTablePaginator', () => {
  test('basic', () => {
    const {container, unmount} = render(
      <SortedTablePaginator onChange={nullEvent} total={100} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('limit', () => {
    const {container, unmount} = render(
      <SortedTablePaginator onChange={nullEvent} total={100} limit={10} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('limit & offset', () => {
    const {container, unmount} = render(
      <SortedTablePaginator
        onChange={nullEvent}
        total={100}
        limit={10}
        offset={5}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('limit larger than size', () => {
    const {container, unmount} = render(
      <SortedTablePaginator onChange={nullEvent} total={100} limit={120} />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('offset larger than size', () => {
    const {container, unmount} = render(
      <SortedTablePaginator
        onChange={nullEvent}
        total={100}
        offset={120}
        limit={10}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });

  test('offset smaller than 0', () => {
    const {container, unmount} = render(
      <SortedTablePaginator
        onChange={nullEvent}
        total={100}
        offset={-20}
        limit={10}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();

    unmount();
  });
});
