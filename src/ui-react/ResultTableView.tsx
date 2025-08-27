import type {
  ResultTableProps,
  ResultTableView as ResultTableViewDecl,
} from '../@types/ui-react/index.js';
import {resultTableView} from './common/index.tsx';
import {useResultRowIds} from './hooks.ts';

export const ResultTableView: typeof ResultTableViewDecl = (
  props: ResultTableProps,
): any => resultTableView(props, useResultRowIds(props.queryId, props.queries));
