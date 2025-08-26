import type {
  SortedTablePaginator as SortedTablePaginatorDecl,
  SortedTablePaginatorProps,
} from '../@types/ui-react-dom/index.js';
import {mathMin} from '../common/other.ts';
import {useCallbackOrUndefined} from './common.tsx';

const LEFT_ARROW = '\u2190';
const RIGHT_ARROW = '\u2192';

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
