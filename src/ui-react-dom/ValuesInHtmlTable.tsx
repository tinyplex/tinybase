import type {
  ExtraValueCell,
  HtmlTableProps,
  ValuesInHtmlTable as ValuesInHtmlTableDecl,
  ValuesInHtmlTableProps,
} from '../@types/ui-react-dom/index.js';
import type {ValueProps} from '../@types/ui-react/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {getProps} from '../common/react.ts';
import {EXTRA, VALUE} from '../common/strings.ts';
import {useValueIds} from '../ui-react/hooks.ts';
import {ValueView} from '../ui-react/index.ts';
import {EditableValueView} from './EditableValueView.tsx';
import {extraHeaders, extraKey} from './common/index.tsx';

const extraValueCells = (
  extraValueCells: ExtraValueCell[] = [],
  extraValueCellProps: ValueProps,
  after: 0 | 1 = 0,
) =>
  arrayMap(extraValueCells, ({component: Component}, index) => (
    <td className={EXTRA} key={extraKey(index, after)}>
      <Component {...extraValueCellProps} />
    </td>
  ));

export const ValuesInHtmlTable: typeof ValuesInHtmlTableDecl = ({
  store,
  editable = false,
  valueComponent: Value = editable ? EditableValueView : ValueView,
  getValueComponentProps,
  extraCellsBefore,
  extraCellsAfter,
  className,
  headerRow,
  idColumn,
}: ValuesInHtmlTableProps & HtmlTableProps): any => (
  <table className={className}>
    {headerRow === false ? null : (
      <thead>
        <tr>
          {extraHeaders(extraCellsBefore)}
          {idColumn === false ? null : <th>Id</th>}
          <th>{VALUE}</th>
          {extraHeaders(extraCellsAfter, 1)}
        </tr>
      </thead>
    )}
    <tbody>
      {arrayMap(useValueIds(store), (valueId) => {
        const valueProps = {valueId, store};
        return (
          <tr key={valueId}>
            {extraValueCells(extraCellsBefore, valueProps)}
            {idColumn === false ? null : <th>{valueId}</th>}
            <td>
              <Value
                {...getProps(getValueComponentProps, valueId)}
                {...valueProps}
              />
            </td>
            {extraValueCells(extraCellsAfter, valueProps, 1)}
          </tr>
        );
      })}
    </tbody>
  </table>
);
