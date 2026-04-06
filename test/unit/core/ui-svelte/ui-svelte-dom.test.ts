import {act, fireEvent, render} from '@testing-library/svelte';
import type {Indexes, Queries, Relationships, Store} from 'tinybase';
import {
  createIndexes,
  createQueries,
  createRelationships,
  createStore,
} from 'tinybase';
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
} from 'tinybase/ui-svelte-dom';
import {beforeEach, describe, expect, test} from 'vitest';

import Custom from './components/dom/Custom.svelte';

let store: Store;
let indexes: Indexes;
let relationships: Relationships;
let queries: Queries;

const getIdsAsProp = (...ids: string[]) => ({...ids});

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
    const {container, unmount} = render(TableInHtmlTable, {
      props: {store, tableId: 't2'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('editable and custom', () => {
    const {container, unmount} = render(TableInHtmlTable, {
      props: {
        store,
        tableId: 't2',
        editable: true,
        customCells: {
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        },
      },
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('SortedTableInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(SortedTableInHtmlTable, {
      props: {store, tableId: 't2', cellId: 'c1', descending: true},
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('paginator', async () => {
    const {container, getAllByRole, unmount} = render(SortedTableInHtmlTable, {
      props: {
        store,
        tableId: 't2',
        cellId: 'c1',
        descending: true,
        limit: 1,
        paginator: true,
      },
    });
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.click(getAllByRole('button')[0]);
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('sortOnClick and custom paginator', async () => {
    const {container, getAllByRole, unmount} = render(SortedTableInHtmlTable, {
      props: {
        store,
        tableId: 't2',
        cellId: 'c1',
        descending: true,
        limit: 1,
        paginator: Custom,
        sortOnClick: true,
        customCells: {
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        },
      },
    });
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.click(getAllByRole('columnheader')[1]);
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.click(getAllByRole('columnheader')[2]);
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('ValuesInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(ValuesInHtmlTable, {props: {store}});
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('editable and custom', () => {
    const {container, unmount} = render(ValuesInHtmlTable, {
      props: {
        store,
        editable: true,
        valueComponent: Custom,
        getValueComponentProps: getIdsAsProp,
      },
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('EditableThing', () => {
  test('EditableCellView cycles through object', async () => {
    const {container, getByRole, unmount} = render(EditableCellView, {
      props: {store, tableId: 't2', rowId: 'r1', cellId: 'c1'},
    });
    const typeButton = getByRole('button');

    await fireEvent.click(typeButton);
    await fireEvent.click(typeButton);
    expect(typeButton.getAttribute('title')).toBe('object');
    expect(container.querySelector('input')?.value).toBe('{}');
    expect(store.getCell('t2', 'r1', 'c1')).toEqual({});

    await fireEvent.click(typeButton);
    expect(typeButton.getAttribute('title')).toBe('array');
    expect(container.querySelector('input')?.value).toBe('[]');
    expect(store.getCell('t2', 'r1', 'c1')).toEqual([]);

    unmount();
  });
});

describe('SliceInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(SliceInHtmlTable, {
      props: {indexes, indexId: 'i1', sliceId: '2'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('editable and custom', () => {
    const {container, unmount} = render(SliceInHtmlTable, {
      props: {
        indexes,
        indexId: 'i1',
        sliceId: '2',
        editable: true,
        customCells: {
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        },
      },
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('RelationshipInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(RelationshipInHtmlTable, {
      props: {relationships, relationshipId: 'r1'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('editable and custom', () => {
    const {container, unmount} = render(RelationshipInHtmlTable, {
      props: {
        relationships,
        relationshipId: 'r1',
        editable: true,
        customCells: {
          't1.c1': {
            label: 'T1C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          't2.c2': {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        },
      },
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('ResultTableInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(ResultTableInHtmlTable, {
      props: {queries, queryId: 'q1'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('custom', () => {
    const {container, unmount} = render(ResultTableInHtmlTable, {
      props: {
        queries,
        queryId: 'q1',
        customCells: {
          c1: {
            label: 'C1',
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
          c2: {
            component: Custom,
            getComponentProps: getIdsAsProp,
          },
        },
      },
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('ResultSortedTableInHtmlTable', () => {
  test('basic', () => {
    const {container, unmount} = render(ResultSortedTableInHtmlTable, {
      props: {queries, queryId: 'q1', cellId: 'c1', descending: true},
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('sortOnClick and paginator', async () => {
    const {container, getAllByRole, unmount} = render(
      ResultSortedTableInHtmlTable,
      {
        props: {
          queries,
          queryId: 'q1',
          cellId: 'c1',
          descending: true,
          sortOnClick: true,
          limit: 1,
          paginator: true,
          customCells: {
            c1: {
              label: 'C1',
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
            c2: {
              component: Custom,
              getComponentProps: getIdsAsProp,
            },
          },
        },
      },
    );
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.click(getAllByRole('columnheader')[1]);
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.click(getAllByRole('button')[0]);
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('EditableCellView', () => {
  test('basic', () => {
    const {container, unmount} = render(EditableCellView, {
      props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('change type and cell', async () => {
    const {container, getAllByRole, unmount} = render(EditableCellView, {
      props: {store, tableId: 't1', rowId: 'r1', cellId: 'c1'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.input(getAllByRole('spinbutton')[0], {
      target: {value: '2'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.click(getAllByRole('button')[0]);
    expect(container.innerHTML).toMatchSnapshot();
    act(() => store.setCell('t1', 'r1', 'c1', 'three'));
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('EditableValueView', () => {
  test('basic', () => {
    const {container, unmount} = render(EditableValueView, {
      props: {store, valueId: 'v1'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });

  test('change type and value', async () => {
    const {container, getAllByRole, unmount} = render(EditableValueView, {
      props: {store, valueId: 'v1'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.input(getAllByRole('spinbutton')[0], {
      target: {value: '2'},
    });
    expect(container.innerHTML).toMatchSnapshot();
    await fireEvent.click(getAllByRole('button')[0]);
    expect(container.innerHTML).toMatchSnapshot();
    act(() => store.setValue('v1', 'three'));
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});

describe('SortedTablePaginator', () => {
  test('states', () => {
    const {container, rerender, unmount} = render(SortedTablePaginator, {
      props: {onChange: nullEvent, total: 100},
    });
    expect(container.innerHTML).toMatchSnapshot();
    rerender({onChange: nullEvent, total: 100, limit: 10});
    expect(container.innerHTML).toMatchSnapshot();
    rerender({onChange: nullEvent, total: 100, limit: 10, offset: 5});
    expect(container.innerHTML).toMatchSnapshot();
    rerender({onChange: nullEvent, total: 100, limit: 10, offset: 120});
    expect(container.innerHTML).toMatchSnapshot();
    unmount();
  });
});
