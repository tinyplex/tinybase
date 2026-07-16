/* @jsxImportSource solid-js */
import type {Component, JSXElement} from 'solid-js';
import {createEffect, createMemo, createSignal} from 'solid-js';
import type {Id} from '../@types/index.d.ts';
import type {
  SortedTablePaginator as SortedTablePaginatorDecl,
  SortedTablePaginatorProps,
} from '../@types/ui-solid-dom/index.d.ts';
import {isFalse, isTrue, mathMin} from '../common/other.ts';
import type {MaybeAccessor} from '../common/solid.ts';
import {getValue} from '../common/solid.ts';
import {getCallbackOrUndefined} from './common/hooks.tsx';
import {HandleSort, SortAndOffset} from './common/index.tsx';

const LEFT_ARROW = '\u2190';
const RIGHT_ARROW = '\u2192';

export const useSortingAndPagination = (
  cellId: MaybeAccessor<Id | undefined>,
  descending: MaybeAccessor<boolean | undefined>,
  sortOnClick: MaybeAccessor<boolean | undefined>,
  offset: MaybeAccessor<number | undefined>,
  limit: MaybeAccessor<number | undefined>,
  total: MaybeAccessor<number>,
  paginator: MaybeAccessor<boolean | Component<SortedTablePaginatorProps>>,
  onChange: MaybeAccessor<((sortAndOffset: SortAndOffset) => void) | undefined>,
): [
  sortAndOffset: () => SortAndOffset,
  handleSort: HandleSort,
  paginatorComponent: (() => JSXElement) | undefined,
] => {
  const [sortAndOffset, setSortAndOffset] = createSignal<SortAndOffset>([
    getValue(cellId),
    !!getValue(descending),
    getValue(offset) ?? 0,
  ]);
  createEffect(() =>
    setSortAndOffset([
      getValue(cellId),
      !!getValue(descending),
      getValue(offset) ?? 0,
    ]),
  );
  const setStateAndChange = (sortAndOffset: SortAndOffset) => {
    setSortAndOffset(sortAndOffset);
    getValue(onChange)?.(sortAndOffset);
  };
  const handleSort = (cellId: Id | undefined) => {
    if (getValue(sortOnClick)) {
      const [currentCellId, currentDescending, currentOffset] = sortAndOffset();
      setStateAndChange([
        cellId,
        cellId == currentCellId ? !currentDescending : false,
        currentOffset,
      ]);
    }
  };
  const handleChangeOffset = (offset: number) => {
    const [currentCellId, currentDescending] = sortAndOffset();
    setStateAndChange([currentCellId, currentDescending, offset]);
  };
  const paginatorComponent = createMemo(() => {
    const resolvedPaginator = getValue(paginator);
    const [_, __, currentOffset] = sortAndOffset();
    const PaginatorComponent = isTrue(resolvedPaginator)
      ? SortedTablePaginator
      : (resolvedPaginator as Component<SortedTablePaginatorProps>);
    return isFalse(resolvedPaginator) ? null : (
      <PaginatorComponent
        offset={currentOffset}
        limit={getValue(limit)}
        total={getValue(total)}
        onChange={handleChangeOffset}
      />
    );
  });
  return [sortAndOffset, handleSort, paginatorComponent];
};

export const SortedTablePaginator: typeof SortedTablePaginatorDecl = (
  props: SortedTablePaginatorProps,
) => {
  createEffect(() => {
    const offset = props.offset ?? 0;
    if (offset > props.total || offset < 0) {
      props.onChange(0);
    }
  });
  const content = () => {
    let offset = props.offset ?? 0;
    const limit = props.limit ?? props.total;
    if (offset > props.total || offset < 0) {
      offset = 0;
    }
    const singular = props.singular ?? 'row';
    const plural = props.plural ?? singular + 's';
    return (
      <>
        {props.total > limit && (
          <>
            <button
              class="previous"
              disabled={offset == 0}
              onClick={getCallbackOrUndefined(
                () => props.onChange(offset - limit),
                offset > 0,
              )}
            >
              {LEFT_ARROW}
            </button>
            <button
              class="next"
              disabled={offset + limit >= props.total}
              onClick={getCallbackOrUndefined(
                () => props.onChange(offset + limit),
                offset + limit < props.total,
              )}
            >
              {RIGHT_ARROW}
            </button>
            {offset + 1} to {mathMin(props.total, offset + limit)}
            {' of '}
          </>
        )}
        {props.total} {props.total != 1 ? plural : singular}
      </>
    );
  };
  return <>{content()}</>;
};
