import {AVG, MAX, MIN, SUM} from './strings.ts';
import {Coll, collForEach, collIsEmpty, collSize, collValues} from './coll.ts';
import {IdMap, mapNew} from './map.ts';
import {isUndefined, mathMax, mathMin} from './other.ts';
import {arraySum} from './array.ts';

type Aggregators<Value, AggregateValue> = [
  (values: Value[], length: number) => AggregateValue,
  ((
    value: AggregateValue,
    add: Value,
    length: number,
  ) => AggregateValue | undefined)?,
  ((
    value: AggregateValue,
    remove: Value,
    length: number,
  ) => AggregateValue | undefined)?,
  ((
    value: AggregateValue,
    add: Value,
    remove: Value,
    length: number,
  ) => AggregateValue | undefined)?,
];

export const numericAggregators: IdMap<Aggregators<number, number>> = mapNew([
  [
    AVG,
    [
      (numbers: number[], length: number): number => arraySum(numbers) / length,
      (metric: number, add: number, length: number): number =>
        metric + (add - metric) / (length + 1),
      (metric: number, remove: number, length: number): number =>
        metric + (metric - remove) / (length - 1),
      (metric: number, add: number, remove: number, length: number): number =>
        metric + (add - remove) / length,
    ],
  ],
  [
    MAX,
    [
      (numbers: number[]): number => mathMax(...numbers),
      (metric: number, add: number): number => mathMax(add, metric),
      (metric: number, remove: number): number | undefined =>
        remove == metric ? undefined : metric,
      (metric: number, add: number, remove: number): number | undefined =>
        remove == metric ? undefined : mathMax(add, metric),
    ],
  ],
  [
    MIN,
    [
      (numbers: number[]): number => mathMin(...numbers),
      (metric: number, add: number): number => mathMin(add, metric),
      (metric: number, remove: number): number | undefined =>
        remove == metric ? undefined : metric,
      (metric: number, add: number, remove: number): number | undefined =>
        remove == metric ? undefined : mathMin(add, metric),
    ],
  ],
  [
    SUM,
    [
      (numbers: number[]): number => arraySum(numbers),
      (metric: number, add: number): number => metric + add,
      (metric: number, remove: number): number => metric - remove,
      (metric: number, add: number, remove: number): number =>
        metric - remove + add,
    ],
  ],
]);

export const getAggregateValue = <Value, AggregateValue>(
  aggregateValue: AggregateValue | undefined,
  oldLength: number,
  newValues: IdMap<Value | undefined>,
  changedValues: Coll<[Value | undefined, Value | undefined]>,
  aggregators: Aggregators<Value, AggregateValue>,
  force = false,
) => {
  if (collIsEmpty(newValues)) {
    return undefined;
  }

  const [aggregate, aggregateAdd, aggregateRemove, aggregateReplace] =
    aggregators;
  force ||= isUndefined(aggregateValue);
  collForEach(changedValues, ([oldValue, newValue]) => {
    if (!force) {
      aggregateValue = isUndefined(oldValue)
        ? aggregateAdd?.(
            aggregateValue as AggregateValue,
            newValue as Value,
            oldLength++,
          )
        : isUndefined(newValue)
          ? aggregateRemove?.(
              aggregateValue as AggregateValue,
              oldValue,
              oldLength--,
            )
          : aggregateReplace?.(
              aggregateValue as AggregateValue,
              newValue,
              oldValue,
              oldLength,
            );
      force ||= isUndefined(aggregateValue);
    }
  });

  return force
    ? aggregate(collValues(newValues) as Value[], collSize(newValues))
    : aggregateValue;
};
