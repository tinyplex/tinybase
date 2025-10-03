import type {
  SortedTablePaginator as SortedTablePaginatorDecl,
  SortedTablePaginatorProps,
} from '../@types/ui-react-dom/index.d.ts';
import {mathMin} from '../common/other.ts';
import {useCallbackOrUndefined} from './common/hooks.tsx';

import type {ComponentType, ReactNode} from 'react';
import type {Id} from '../@types/index.d.ts';
import {useCallback, useMemo, useState} from '../common/react.ts';
import {HandleSort, SortAndOffset} from './common/index.tsx';

const LEFT_ARROW = '\u2190';
const RIGHT_ARROW = '\u2192';

export const useSortingAndPagination = (
  cellId: Id | undefined,
  descending = false,
  sortOnClick: boolean | undefined,
  offset = 0,
  limit: number | undefined,
  total: number,
  paginator: boolean | ComponentType<SortedTablePaginatorProps>,
  onChange?: (sortAndOffset: SortAndOffset) => void,
): [
  sortAndOffset: SortAndOffset,
  handleSort: HandleSort,
  paginatorComponent: ReactNode | undefined,
] => {
  const [[currentCellId, currentDescending, currentOffset], setState] =
    useState<SortAndOffset>([cellId, descending, offset]);
  const setStateAndChange = useCallback(
    (sortAndOffset: SortAndOffset) => {
      setState(sortAndOffset);
      onChange?.(sortAndOffset);
    },
    [onChange],
  );
  const handleSort = useCallbackOrUndefined(
    (cellId: Id | undefined) =>
      setStateAndChange([
        cellId,
        cellId == currentCellId ? !currentDescending : false,
        currentOffset,
      ]),
    [setStateAndChange, currentCellId, currentDescending, currentOffset],
    sortOnClick,
  );
  const handleChangeOffset = useCallback(
    (offset: number) =>
      setStateAndChange([currentCellId, currentDescending, offset]),
    [setStateAndChange, currentCellId, currentDescending],
  );
  const PaginatorComponent =
    paginator === true
      ? SortedTablePaginator
      : (paginator as ComponentType<SortedTablePaginatorProps>);
  return [
    [currentCellId, currentDescending, currentOffset],
    handleSort,
    useMemo(
      () =>
        paginator === false ? null : (
          <PaginatorComponent
            offset={currentOffset}
            limit={limit}
            total={total}
            onChange={handleChangeOffset}
          />
        ),
      [
        paginator,
        PaginatorComponent,
        currentOffset,
        limit,
        total,
        handleChangeOffset,
      ],
    ),
  ];
};

export const SortedTablePaginator: typeof SortedTablePaginatorDecl = ({
  onChange,
  total,
  offset = 0,
  limit = total,
  singular = 'row',
  plural = singular + 's',
}: SortedTablePaginatorProps) => {
  if (offset > total || offset < 0) {
    offset = 0;
    onChange(0);
  }
  const handlePrevClick = useCallbackOrUndefined(
    () => onChange(offset - limit),
    [onChange, offset, limit],
    offset > 0,
  );
  const handleNextClick = useCallbackOrUndefined(
    () => onChange(offset + limit),
    [onChange, offset, limit],
    offset + limit < total,
  );
  return (
    <>
      {total > limit && (
        <>
          <button
            className="previous"
            disabled={offset == 0}
            onClick={handlePrevClick}
          >
            {LEFT_ARROW}
          </button>
          <button
            className="next"
            disabled={offset + limit >= total}
            onClick={handleNextClick}
          >
            {RIGHT_ARROW}
          </button>
          {offset + 1} to {mathMin(total, offset + limit)}
          {' of '}
        </>
      )}
      {total} {total != 1 ? plural : singular}
    </>
  );
};
