import type {Component} from 'svelte';
import type {
  SortedTablePaginatorProps,
} from '../../@types/ui-svelte-dom/index.d.ts';
import type {Id} from '../../@types/common/index.d.ts';
import {isFalse, isTrue} from '../../common/other.ts';
import type {HandleSort, Paginator, SortAndOffset} from './index.ts';
import SortedTablePaginator from '../SortedTablePaginator.svelte';

export const createSortingAndPagination = (
  getCellId: () => Id | undefined,
  getDescending: () => boolean | undefined,
  getSortOnClick: () => boolean | undefined,
  getOffset: () => number | undefined,
  getLimit: () => number | undefined,
  getTotal: () => number,
  getPaginator: () => boolean | Component<SortedTablePaginatorProps>,
  getOnChange: () => ((sortAndOffset: SortAndOffset) => void) | undefined,
): {
  readonly sortAndOffset: SortAndOffset;
  readonly handleSort: HandleSort | undefined;
  readonly paginator: Paginator | undefined;
} => {
  let currentCellId = $state(getCellId());
  let currentDescending = $state(getDescending() ?? false);
  let currentOffset = $state(getOffset() ?? 0);

  const setState = (sortAndOffset: SortAndOffset) => {
    currentCellId = sortAndOffset[0];
    currentDescending = sortAndOffset[1];
    currentOffset = sortAndOffset[2];
    getOnChange()?.(sortAndOffset);
  };

  const handleSort = getSortOnClick()
    ? ((nextCellId) =>
        setState([
          nextCellId,
          nextCellId == currentCellId ? !currentDescending : false,
          currentOffset,
        ])) satisfies HandleSort
    : undefined;

  const handleChangeOffset = (nextOffset: number) =>
    setState([currentCellId, currentDescending, nextOffset]);

  const paginator = getPaginator();
  const PaginatorComponent = isTrue(paginator)
    ? SortedTablePaginator
    : (paginator as Component<SortedTablePaginatorProps>);

  return {
    get sortAndOffset() {
      return [currentCellId, currentDescending, currentOffset] as SortAndOffset;
    },
    get handleSort() {
      return handleSort;
    },
    get paginator() {
      return isFalse(paginator)
        ? undefined
        : {
            component: PaginatorComponent,
            props: {
              offset: currentOffset,
              limit: getLimit(),
              total: getTotal(),
              onChange: handleChangeOffset,
            },
          };
    },
  };
};
