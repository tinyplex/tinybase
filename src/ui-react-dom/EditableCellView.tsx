import type {EditableCellView as EditableCellViewDecl} from '../@types/ui-react-dom/index.d.ts';
import type {CellProps} from '../@types/ui-react/index.d.ts';
import {CELL} from '../common/strings.ts';
import {useCellState, useStoreOrStoreById} from '../ui-react/hooks.ts';
import {EditableThing} from './common/components.tsx';
import {EDITABLE} from './common/index.tsx';

export const EditableCellView: typeof EditableCellViewDecl = ({
  tableId,
  rowId,
  cellId,
  store,
  className,
  showType,
}: CellProps & {readonly className?: string; readonly showType?: boolean}) => {
  const [cell, setCell] = useCellState(tableId, rowId, cellId, store);
  return (
    <EditableThing
      thing={cell}
      onThingChange={setCell}
      className={className ?? EDITABLE + CELL}
      showType={showType}
      hasSchema={useStoreOrStoreById(store)?.hasTablesSchema}
    />
  );
};
