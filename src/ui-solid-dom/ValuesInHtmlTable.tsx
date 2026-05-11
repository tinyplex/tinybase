/* @jsxImportSource solid-js */
import type {JSXElement} from 'solid-js';
import type {
  ExtraValueCell,
  HtmlTableProps,
  ValuesInHtmlTable as ValuesInHtmlTableDecl,
  ValuesInHtmlTableProps,
} from '../@types/ui-solid-dom/index.d.ts';
import type {ValueProps} from '../@types/ui-solid/index.d.ts';
import {arrayMap} from '../common/array.ts';
import {isFalse} from '../common/other.ts';
import {getProps, getValue} from '../common/solid.ts';
import {EXTRA, VALUE} from '../common/strings.ts';
import {ValueView} from '../ui-solid/index.ts';
import {useValueIds} from '../ui-solid/primitives.ts';
import {EditableValueView} from './EditableValueView.tsx';
import {extraHeaders} from './common/index.tsx';

const extraValueCells = (
  extraValueCells: ExtraValueCell[] | (() => ExtraValueCell[] | undefined) = [],
  extraValueCellProps: ValueProps,
) =>
  arrayMap(getValue(extraValueCells) ?? [], (extraValueCell) => {
    const Component = extraValueCell.component;
    return (
      <td class={EXTRA}>
        <Component {...extraValueCellProps} />
      </td>
    );
  });

export const ValuesInHtmlTable: typeof ValuesInHtmlTableDecl = (
  props: ValuesInHtmlTableProps & HtmlTableProps,
): JSXElement => {
  const valueIds = useValueIds(() => props.store);
  // eslint-disable-next-line solid/reactivity
  return (() => {
    const Value =
      props.valueComponent ??
      (getValue(props.editable as any) === true
        ? EditableValueView
        : ValueView);
    return (
      <table class={props.className}>
        {props.headerRow === false ? null : (
          <thead>
            <tr>
              {extraHeaders(props.extraCellsBefore as any)}
              {props.idColumn === false ? null : <th>Id</th>}
              <th>{VALUE}</th>
              {extraHeaders(props.extraCellsAfter as any)}
            </tr>
          </thead>
        )}
        <tbody>
          {arrayMap(valueIds(), (valueId) => {
            const valueProps = {valueId, store: props.store};
            return (
              <tr>
                {extraValueCells(props.extraCellsBefore as any, valueProps)}
                {isFalse(props.idColumn) ? null : (
                  <th title={valueId}>{valueId}</th>
                )}
                <td>
                  <Value
                    {...getProps(props.getValueComponentProps, valueId)}
                    {...valueProps}
                  />
                </td>
                {extraValueCells(props.extraCellsAfter as any, valueProps)}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }) as unknown as JSXElement;
};
