<script lang="ts">
  import type {Id, Store} from 'tinybase';
  import {
    getCell,
    getCellIds,
    getRow,
    getRowCount,
    getRowIds,
    getSortedRowIds,
    getTable,
    getTableCellIds,
    getTableIds,
    getTables,
    getValue,
    getValueIds,
    getValues,
    hasCell,
    hasRow,
    hasTable,
    hasTableCell,
    hasTables,
    hasValue,
    hasValues,
  } from 'tinybase/ui-svelte';

  let {
    mode,
    store,
    tableId,
    rowId,
    cellId,
    valueId,
    descending,
    offset,
    limit,
  }: {
    mode: string;
    store: Store;
    tableId?: Id;
    rowId?: Id;
    cellId?: Id;
    valueId?: Id;
    descending?: boolean;
    offset?: number;
    limit?: number;
  } = $props();

  const getMode = () => mode;
  const value =
    getMode() == 'hasTables'
      ? hasTables(() => store)
      : getMode() == 'tables'
        ? getTables(() => store)
        : getMode() == 'tableIds'
          ? getTableIds(() => store)
          : getMode() == 'hasTable'
            ? hasTable(
                () => tableId,
                () => store,
              )
            : getMode() == 'table'
              ? getTable(
                  () => tableId,
                  () => store,
                )
              : getMode() == 'tableCellIds'
                ? getTableCellIds(
                    () => tableId,
                    () => store,
                  )
                : getMode() == 'hasTableCell'
                  ? hasTableCell(
                      () => tableId,
                      () => cellId,
                      () => store,
                    )
                  : getMode() == 'rowCount'
                    ? getRowCount(
                        () => tableId,
                        () => store,
                      )
                    : getMode() == 'rowIds'
                      ? getRowIds(
                          () => tableId,
                          () => store,
                        )
                      : getMode() == 'sortedRowIds'
                        ? getSortedRowIds(
                            () => tableId,
                            () => cellId,
                            () => descending,
                            () => offset,
                            () => limit,
                            () => store,
                          )
                        : getMode() == 'hasRow'
                          ? hasRow(
                              () => tableId,
                              () => rowId,
                              () => store,
                            )
                          : getMode() == 'row'
                            ? getRow(
                                () => tableId,
                                () => rowId,
                                () => store,
                              )
                            : getMode() == 'cellIds'
                              ? getCellIds(
                                  () => tableId,
                                  () => rowId,
                                  () => store,
                                )
                              : getMode() == 'hasCell'
                                ? hasCell(
                                    () => tableId,
                                    () => rowId,
                                    () => cellId,
                                    () => store,
                                  )
                                : getMode() == 'cell'
                                  ? getCell(
                                      () => tableId,
                                      () => rowId,
                                      () => cellId,
                                      () => store,
                                    )
                                  : getMode() == 'hasValues'
                                    ? hasValues(() => store)
                                    : getMode() == 'values'
                                      ? getValues(() => store)
                                      : getMode() == 'valueIds'
                                        ? getValueIds(() => store)
                                        : getMode() == 'hasValue'
                                          ? hasValue(
                                              () => valueId,
                                              () => store,
                                            )
                                          : getMode() == 'value'
                                            ? getValue(
                                                () => valueId,
                                                () => store,
                                              )
                                            : {current: undefined};
</script>

{JSON.stringify(value.current)}
