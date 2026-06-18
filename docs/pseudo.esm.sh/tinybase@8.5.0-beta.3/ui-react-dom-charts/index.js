// dist/ui-react-dom-charts/index.js
import React from "https://esm.sh/react@^19.2.7";
import { Fragment as Fragment$1, jsx, jsxs } from "https://esm.sh/react@^19.2.7/jsx-runtime";
var getTypeOf = (thing) => typeof thing;
var TINYBASE = "tinybase";
var EMPTY_STRING = "";
var STRING = getTypeOf(EMPTY_STRING);
var NUMBER = getTypeOf(0);
var LISTENER = "Listener";
var RESULT = "Result";
var GET = "get";
var ADD = "add";
var IDS = "Ids";
var ROW = "Row";
var SORTED_ROW_IDS = "Sorted" + ROW + IDS;
var CELL = "Cell";
var math = Math;
var getIfNotFunction = (predicate) => (value, then, otherwise) => predicate(value) ? (
  /* istanbul ignore next */
  otherwise?.()
) : then(value);
var GLOBAL = globalThis;
var number = Number;
var string = String;
var mathMax = math.max;
var mathMin = math.min;
var mathCeil = math.ceil;
var mathFloor = math.floor;
var mathPow = math.pow;
var mathRound = math.round;
var mathAbs = math.abs;
var mathLog10 = math.log10;
var infinity = Infinity;
var epsilon = Number.EPSILON;
var isFiniteNumber = isFinite;
var isInteger = number.isInteger;
var isNullish = (thing) => thing == null;
var isUndefined = (thing) => thing === void 0;
var isNull = (thing) => thing === null;
var isTrue = (thing) => thing === true;
var isFalse = (thing) => thing === false;
var ifNotNullish = getIfNotFunction(isNullish);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isString = (thing) => getTypeOf(thing) == STRING;
var isNumber = (thing) => getTypeOf(thing) == NUMBER;
var isArray = (thing) => Array.isArray(thing);
var size = (arrayOrString) => arrayOrString.length;
var test = (regex, subject) => regex.test(subject);
var {
  Children,
  Fragment,
  PureComponent,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} = React;
var SourceType = /* @__PURE__ */ ((SourceType2) => {
  SourceType2[SourceType2["None"] = 0] = "None";
  SourceType2[SourceType2["Query"] = 1] = "Query";
  SourceType2[SourceType2["Table"] = 2] = "Table";
  return SourceType2;
})(SourceType || {});
var SERIES = "_tinybaseChartSeries";
var X_AXIS = "_tinybaseChartXAxis";
var Y_AXIS = "_tinybaseChartYAxis";
var isSeriesComponent = (component) => typeof component == "function" && component[SERIES] === true;
var isXAxisComponent = (component) => typeof component == "function" && component[X_AXIS] === true;
var isYAxisComponent = (component) => typeof component == "function" && component[Y_AXIS] === true;
var CartesianChartContext = createContext(null);
var useCartesianChartContext = () => {
  const context = useContext(CartesianChartContext);
  if (context == null) {
    throw new Error("Series components must be used inside a CartesianChart");
  }
  return context;
};
var arrayNew = (size2, cb) => arrayMap(new Array(size2).fill(0), (_, index) => cb(index));
var arrayHas = (array, value) => array.includes(value);
var arrayIndexOf = (array, value) => array.indexOf(value);
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index) => array2[index] === value1);
var arrayOrValueEqual = (value1, value2) => isArray(value1) && isArray(value2) ? arrayIsEqual(value1, value2) : value1 === value2;
var arraySort = (array, sorter) => array.sort(sorter);
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayJoin = (array, sep = EMPTY_STRING) => array.join(sep);
var arrayMap = (array, cb) => array.map(cb);
var arrayIsEmpty = (array) => size(array) == 0;
var arrayFilter = (array, cb) => array.filter(cb);
var arrayPush = (array, ...values) => array.push(...values);
var arrayShift = (array) => array.shift();
var collSize = (coll) => coll?.size ?? 0;
var NICE_NUMBERS = [1, 5, 2, 2.5, 4, 3];
var WEIGHTS = [0.25, 0.2, 0.5, 0.05];
var getTicks = (min, max, targetTickCount, labelSize, axisSize, integerTicks) => {
  let bestTicks = [min, max];
  let bestScore = -2;
  const range = max - min;
  for (let j = 1; j < infinity; j++) {
    for (const niceNumber of NICE_NUMBERS) {
      const simplicityMax = 1 - arrayIndexOf(NICE_NUMBERS, niceNumber) / mathMax(size(NICE_NUMBERS) - 1, 1) - j + 1;
      if (WEIGHTS[0] * simplicityMax + WEIGHTS[1] + WEIGHTS[2] + WEIGHTS[3] < bestScore) {
        return bestTicks;
      }
      for (let tickCount = 2; tickCount < infinity; tickCount++) {
        const densityMax = tickCount >= targetTickCount ? 2 - (tickCount - 1) / (targetTickCount - 1) : 1;
        if (WEIGHTS[0] * simplicityMax + WEIGHTS[1] + WEIGHTS[2] * densityMax + WEIGHTS[3] < bestScore) {
          break;
        }
        for (let exponent = mathCeil(
          mathLog10(range / (tickCount + 1) / j / niceNumber)
        ); exponent < infinity; exponent++) {
          const step = j * niceNumber * mathPow(10, exponent);
          if (WEIGHTS[0] * simplicityMax + WEIGHTS[1] * (step * (tickCount - 1) <= max - min ? 1 : 1 - mathPow((step * (tickCount - 1) - (max - min)) / 2, 2) / mathPow(0.1 * (max - min), 2)) + WEIGHTS[2] * densityMax + WEIGHTS[3] < bestScore) {
            break;
          }
          const minStart = mathFloor(max / step) * j - (tickCount - 1) * j;
          const maxStart = mathCeil(min / step) * j;
          if (minStart <= maxStart) {
            arrayForEach(
              arrayNew(maxStart - minStart + 1, (index) => minStart + index),
              (start) => {
                const tickMin = start * (step / j);
                const tickMax = tickMin + step * (tickCount - 1);
                const density = (tickCount - 1) / (tickMax - tickMin);
                const targetDensity = (targetTickCount - 1) / (mathMax(tickMax, max) - mathMin(min, tickMin));
                const spacing = axisSize / (tickCount - 1);
                const score = WEIGHTS[0] * (1 - arrayIndexOf(NICE_NUMBERS, niceNumber) / mathMax(size(NICE_NUMBERS) - 1, 1) - j + (mathAbs(tickMin / step - mathRound(tickMin / step)) < epsilon * 100 && tickMin <= 0 && tickMax >= 0 ? 1 : 0)) + WEIGHTS[1] * (1 - (mathPow(max - tickMax, 2) + mathPow(min - tickMin, 2)) / (2 * mathPow(0.1 * (max - min), 2))) + WEIGHTS[2] * (2 - mathMax(
                  density / targetDensity,
                  targetDensity / density
                )) + WEIGHTS[3] * (spacing < labelSize * 1.2 ? -infinity : mathMin(spacing, 1)) + (integerTicks && (mathAbs(step - mathRound(step)) > epsilon * 100 || mathAbs(tickMin - mathRound(tickMin)) > epsilon * 100) ? -1 : 0);
                if (score > bestScore) {
                  bestTicks = arrayNew(
                    mathFloor((tickMax - tickMin) / step + 0.5) + 1,
                    (index) => mathRound((tickMin + index * step) * 1e6) / 1e6
                  );
                  bestScore = score;
                }
              }
            );
          }
        }
      }
    }
  }
  return bestTicks;
};
var TARGET_TICKS = 10;
var getDataPoints = (rowIds, getPoint) => arrayFilter(arrayMap(rowIds, getPoint), (point) => !isUndefined(point));
var getDataPoint = (rowId, xCell, yCell) => {
  const xValue = getXValue(xCell);
  const yValue = getYValue(yCell);
  return isUndefined(xValue) || isUndefined(yValue) ? void 0 : [rowId, xValue, yValue];
};
var getScaledPoints = (kind, points, [xMin, xMax, yMin, yMax], [width, height], xValues, xTitle, yTitle) => {
  const numericX = kind == "line" && arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)));
  const xDomain = numericX ? [xMin, xMax] : [0, 0];
  const yDomain = [yMin ?? 0, yMax ?? 0];
  const xCategories = /* @__PURE__ */ new Map();
  arrayForEach(
    xValues == null || arrayIsEmpty(xValues) ? arrayMap(points, ([, xValue]) => xValue) : xValues,
    (xValue) => {
      if (!xCategories.has(xValue)) {
        xCategories.set(xValue, collSize(xCategories));
      }
    }
  );
  return arrayMap(points, ([rowId, xValue, yValue]) => [
    rowId,
    xValue,
    yValue,
    getX(xValue, numericX, xDomain, xCategories, width, kind),
    getY(yValue, yDomain, height),
    xTitle,
    yTitle
  ]);
};
var getX = (xValue, numericX, [xMin, xMax], xCategories, width, kind) => numericX ? getScale(xValue, xMin, xMax, width) : kind == "bar" ? width * ((xCategories.get(xValue) ?? 0) + 0.5) / collSize(xCategories) : getScale(
  xCategories.get(xValue) ?? 0,
  0,
  collSize(xCategories) - 1,
  width
);
var getY = (yValue, [yMin, yMax], height) => height - getScale(yValue, yMin, yMax, height);
var getScale = (value, min, max, size2) => min == max ? size2 / 2 : getRounded(size2 * (value - min) / (max - min));
var getBounds = (kind, points) => {
  if (arrayIsEmpty(points)) {
    return [];
  }
  const [yMin, yMax] = getYDomain(points, kind);
  if (arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)))) {
    const [xMin, xMax] = getDomain(arrayMap(points, ([, xValue]) => xValue));
    return [xMin, xMax, yMin, yMax];
  }
  return [points[0]?.[1], points[size(points) - 1]?.[1], yMin, yMax];
};
var getYTicks = ([, , yMin, yMax], [, height], labelSize, tickCount) => {
  if (isUndefined(yMin) || isUndefined(yMax)) {
    return [];
  }
  if (yMin == yMax) {
    return [yMin];
  }
  return getTicks(
    yMin,
    yMax,
    getTickCount(tickCount),
    labelSize,
    height,
    isInteger(yMin) && isInteger(yMax)
  );
};
var getXTicks = (kind, [xMin, xMax], [width], labelSize, tickCount) => kind == "line" && isNumber(xMin) && isNumber(xMax) && xMin != xMax ? getTicks(
  xMin,
  xMax,
  getTickCount(tickCount),
  labelSize,
  width,
  isInteger(xMin) && isInteger(xMax)
) : [];
var getTickBounds = ([xMin, xMax, yMin, yMax], xTicks, yTicks) => [
  arrayIsEmpty(xTicks) ? xMin : getMinTickBound(xMin, xTicks[0]),
  arrayIsEmpty(xTicks) ? xMax : getMaxTickBound(xMax, xTicks[size(xTicks) - 1]),
  arrayIsEmpty(yTicks) ? yMin : mathMin(yMin ?? infinity, yTicks[0]),
  arrayIsEmpty(yTicks) ? yMax : mathMax(yMax ?? -infinity, yTicks[size(yTicks) - 1])
];
var getSeriesSummary = (kind, points, xCellId, yCellId, yLabel) => {
  const [xMin, xMax, yMin, yMax] = getBounds(kind, points);
  const xValues = [];
  const continuousX = kind == "line" && arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)));
  arrayForEach(points, ([, xValue]) => {
    if (!arrayHas(xValues, xValue)) {
      arrayPush(xValues, xValue);
    }
  });
  return {
    continuousX,
    xCellId,
    xMin,
    xMax,
    yMin,
    yMax,
    yCellId,
    yLabel,
    xValues
  };
};
var getDomainState = (summaries) => {
  const xValues = [];
  const xMins = [];
  const xMaxes = [];
  const yMins = [];
  const yMaxes = [];
  let continuousX = true;
  let xMin;
  let xMax;
  arrayForEach(summaries, (summary) => {
    continuousX &&= summary.continuousX;
    arrayForEach(summary.xValues, (xValue) => {
      if (!arrayHas(xValues, xValue)) {
        arrayPush(xValues, xValue);
      }
    });
    if (isNumber(summary.xMin) && isNumber(summary.xMax)) {
      xMins.push(summary.xMin);
      xMaxes.push(summary.xMax);
    } else {
      xMin ??= summary.xMin;
      xMax = summary.xMax ?? xMax;
    }
    if (!isUndefined(summary.yMin)) {
      yMins.push(summary.yMin);
    }
    if (!isUndefined(summary.yMax)) {
      yMaxes.push(summary.yMax);
    }
  });
  return {
    bounds: [
      arrayIsEmpty(xMins) ? xMin : mathMin(...xMins),
      arrayIsEmpty(xMaxes) ? xMax : mathMax(...xMaxes),
      arrayIsEmpty(yMins) ? void 0 : mathMin(...yMins),
      arrayIsEmpty(yMaxes) ? void 0 : mathMax(...yMaxes)
    ],
    continuousX: !arrayIsEmpty(summaries) && continuousX,
    xValues
  };
};
var getYDomain = (points, kind = "bar") => getDomain([
  ...kind == "bar" ? [0] : [],
  ...arrayMap(points, ([, , yValue]) => yValue)
]);
var getDomain = (values) => {
  const min = mathMin(...values);
  return min == infinity ? [0, 0] : [min, mathMax(...values)];
};
var getMinTickBound = (bound, tick) => isNumber(bound) ? mathMin(bound, tick) : tick;
var getMaxTickBound = (bound, tick) => isNumber(bound) ? mathMax(bound, tick) : tick;
var getTickCount = (tickCount = TARGET_TICKS) => isFiniteNumber(tickCount) ? mathMax(mathRound(tickCount), 1) : TARGET_TICKS;
var getRounded = (value) => mathRound(value * 1e6) / 1e6;
var getXValue = (cell) => isNumber(cell) ? isFiniteNumber(cell) ? cell : void 0 : isString(cell) ? cell : isTrue(cell) || isFalse(cell) ? cell : void 0;
var getYValue = (cell) => isNumber(cell) && isFiniteNumber(cell) ? cell : void 0;
var CURRENT_COLOR = "currentColor";
var Bars = ({
  points,
  plotFrame,
  barGap,
  barSeriesCount,
  barSeriesIndex,
  setTooltipPoint,
  yMin = 0,
  yMax = 0
}) => {
  const [plotX, plotY, width, height] = plotFrame;
  const baselineY = height - getScale(0, yMin, yMax, height);
  const pointsSize = size(points);
  const fullBarWidth = arrayIsEmpty(points) ? 0 : width / pointsSize;
  const barCount = mathMax(barSeriesCount, 1);
  const barIndex = mathMax(barSeriesIndex, 0);
  const barGroupWidth = mathMax(fullBarWidth - barGap, 0);
  const barWidth = mathMax(
    (barGroupWidth - barGap * (barCount - 1)) / barCount,
    0
  );
  return arrayMap(points, (point) => {
    const [rowId, , , x, pointY] = point;
    const y = mathMin(pointY, baselineY);
    return /* @__PURE__ */ jsx(
      "rect",
      {
        className: "bar",
        height: mathAbs(baselineY - pointY),
        onPointerEnter: () => setTooltipPoint(point),
        onPointerLeave: () => setTooltipPoint(void 0),
        width: barWidth,
        x: plotX + x - barGroupWidth / 2 + (barWidth + barGap) * barIndex,
        y: plotY + y
      },
      rowId
    );
  });
};
var object = Object;
var getPrototypeOf = (obj) => object.getPrototypeOf(obj);
var objEntries = object.entries;
var isObject = (obj) => !isNullish(obj) && ifNotNullish(
  getPrototypeOf(obj),
  (objPrototype) => objPrototype == object.prototype || isNullish(getPrototypeOf(objPrototype)),
  /* istanbul ignore next */
  () => true
);
var objIds = object.keys;
var objGet = (obj, id) => ifNotUndefined(obj, (obj2) => obj2[id]);
var objValues = (obj) => object.values(obj);
var objSize = (obj) => size(objIds(obj));
var objIsEqual = (obj1, obj2, isEqual2 = (value1, value2) => value1 === value2) => {
  const entries1 = objEntries(obj1);
  return size(entries1) === objSize(obj2) && arrayEvery(
    entries1,
    ([index, value1]) => isObject(value1) ? (
      /* istanbul ignore next */
      isObject(obj2[index]) ? objIsEqual(obj2[index], value1, isEqual2) : false
    ) : isEqual2(value1, obj2[index])
  );
};
var jsonString = JSON.stringify;
var TINYBASE_CONTEXT = TINYBASE + "_uirc";
var Context = GLOBAL[TINYBASE_CONTEXT] ? (
  /* istanbul ignore next */
  GLOBAL[TINYBASE_CONTEXT]
) : GLOBAL[TINYBASE_CONTEXT] = createContext([]);
var useThing = (id, offset) => {
  const contextValue = useContext(Context);
  return isUndefined(id) ? contextValue[offset * 2] : isString(id) ? objGet(contextValue[offset * 2 + 1], id) : id;
};
var useThingOrThingById = (thingOrThingId, offset) => {
  const thing = useThing(thingOrThingId, offset);
  return isUndefined(thingOrThingId) || isString(thingOrThingId) ? thing : thingOrThingId;
};
var OFFSET_STORE = 0;
var OFFSET_QUERIES = 4;
var EMPTY_ARRAY = [];
var DEFAULTS = [
  {},
  [],
  [EMPTY_ARRAY, void 0, EMPTY_ARRAY],
  {},
  void 0,
  void 0,
  false,
  0
];
var cellOrValueEqual = (thing1, thing2) => thing1 === thing2 || (isObject(thing1) || isArray(thing1)) && jsonString(thing1) === jsonString(thing2);
var IS_EQUALS = [
  (obj1, obj2) => objIsEqual(obj1, obj2, cellOrValueEqual),
  arrayIsEqual,
  ([backwardIds1, currentId1, forwardIds1], [backwardIds2, currentId2, forwardIds2]) => currentId1 === currentId2 && arrayIsEqual(backwardIds1, backwardIds2) && arrayIsEqual(forwardIds1, forwardIds2),
  (paramValues1, paramValues2) => objIsEqual(paramValues1, paramValues2, arrayOrValueEqual),
  arrayOrValueEqual,
  cellOrValueEqual
];
var isEqual = (thing1, thing2) => thing1 === thing2;
var addAndDelListener = (thing, listenable, ...args) => {
  const listenerId = thing?.[ADD + listenable + LISTENER]?.(...args);
  return () => thing?.delListener?.(listenerId);
};
var useListenable = (listenable, thing, returnType, args = EMPTY_ARRAY) => {
  const lastResultRef = useRef(DEFAULTS[returnType]);
  const getResult = useCallback(
    () => {
      const nextResult = thing?.[GET + listenable]?.(...args) ?? DEFAULTS[returnType];
      return !(IS_EQUALS[returnType] ?? isEqual)(
        nextResult,
        lastResultRef.current
      ) ? lastResultRef.current = nextResult : lastResultRef.current;
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args]
  );
  const subscribe = useCallback(
    (listener) => addAndDelListener(thing, EMPTY_STRING + listenable, ...args, listener),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [thing, returnType, listenable, ...args]
  );
  return useSyncExternalStore(subscribe, getResult, getResult);
};
var useListener = (listenable, thing, listener, listenerDeps = EMPTY_ARRAY, preArgs = EMPTY_ARRAY, ...postArgs) => useLayoutEffect(
  () => addAndDelListener(thing, listenable, ...preArgs, listener, ...postArgs),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [thing, listenable, ...preArgs, ...listenerDeps, ...postArgs]
);
var useSortedRowIdsImpl = (tableId, cellId, descending, offset, limit, storeOrStoreId) => useListenable(
  SORTED_ROW_IDS,
  useStoreOrStoreById(storeOrStoreId),
  1,
  [tableId, cellId, descending, offset, limit]
);
var useStoreOrStoreById = (storeOrStoreId) => useThingOrThingById(storeOrStoreId, OFFSET_STORE);
var useSortedRowIds = (tableIdOrArgs, cellIdOrStoreOrStoreId, descending, offset, limit, storeOrStoreId) => useSortedRowIdsImpl(
  ...isObject(tableIdOrArgs) ? [
    tableIdOrArgs.tableId,
    tableIdOrArgs.cellId,
    tableIdOrArgs.descending ?? false,
    tableIdOrArgs.offset ?? 0,
    tableIdOrArgs.limit,
    cellIdOrStoreOrStoreId
  ] : [
    tableIdOrArgs,
    cellIdOrStoreOrStoreId,
    descending,
    offset,
    limit,
    storeOrStoreId
  ]
);
var useCellListener = (tableId, rowId, cellId, listener, listenerDeps, mutator, storeOrStoreId) => useListener(
  CELL,
  useStoreOrStoreById(storeOrStoreId),
  listener,
  listenerDeps,
  [tableId, rowId, cellId],
  mutator
);
var useQueriesOrQueriesById = (queriesOrQueriesId) => useThingOrThingById(queriesOrQueriesId, OFFSET_QUERIES);
var useResultSortedRowIds = (queryId, cellId, descending, offset = 0, limit, queriesOrQueriesId) => useListenable(
  RESULT + SORTED_ROW_IDS,
  useQueriesOrQueriesById(queriesOrQueriesId),
  1,
  [queryId, cellId, descending, offset, limit]
);
var useResultCellListener = (queryId, rowId, cellId, listener, listenerDeps, queriesOrQueriesId) => useListener(
  RESULT + CELL,
  useQueriesOrQueriesById(queriesOrQueriesId),
  listener,
  listenerDeps,
  [queryId, rowId, cellId]
);
var EMPTY_ID = "";
var useSeriesData = ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId
}) => {
  const [, rerender] = useState();
  const context = useCartesianChartContext();
  const {
    getSeriesId,
    queries,
    queriesOrQueriesId,
    queryId,
    releaseSeriesId,
    sourceType,
    store,
    storeOrStoreId,
    tableId
  } = context;
  const [seriesId] = useState(getSeriesId);
  const handleChange = useCallback(() => rerender([]), [rerender]);
  const tableRowIds = useSortedRowIds(
    tableId ?? EMPTY_ID,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    storeOrStoreId
  );
  const queryRowIds = useResultSortedRowIds(
    queryId ?? EMPTY_ID,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    queriesOrQueriesId
  );
  const rowIds = sourceType == SourceType.Table ? tableRowIds : queryRowIds;
  const points = yCellId == null ? [] : getDataPoints(
    rowIds,
    (rowId) => getDataPoint(
      rowId,
      getCell(
        sourceType,
        store,
        queries,
        tableId,
        queryId,
        rowId,
        xCellId
      ),
      getCell(
        sourceType,
        store,
        queries,
        tableId,
        queryId,
        rowId,
        yCellId
      )
    )
  );
  useCellListener(
    sourceType == SourceType.Table ? tableId ?? null : null,
    null,
    xCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId
  );
  useCellListener(
    sourceType == SourceType.Table ? tableId ?? null : null,
    null,
    yCellId ?? null,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId
  );
  useResultCellListener(
    sourceType == SourceType.Query ? queryId ?? null : null,
    null,
    xCellId,
    handleChange,
    [handleChange],
    queriesOrQueriesId
  );
  useResultCellListener(
    sourceType == SourceType.Query ? queryId ?? null : null,
    null,
    yCellId ?? null,
    handleChange,
    [handleChange],
    queriesOrQueriesId
  );
  useLayoutEffect(
    () => () => releaseSeriesId(seriesId),
    [releaseSeriesId, seriesId]
  );
  return [seriesId, points];
};
var getSeriesClassName = (baseClassName, className) => className == null ? baseClassName : `${baseClassName} ${className}`;
var getCell = (sourceType, store, queries, tableId, queryId, rowId, cellId) => sourceType == SourceType.Table ? store?.getCell(tableId, rowId, cellId) : queries?.getResultCell(queryId, rowId, cellId);
var BarSeries = (props) => {
  const {
    barSeriesCount,
    bounds,
    getBarSeriesIndex,
    layout: [, , [, , barGap]],
    plotFrame,
    plotSize,
    registerBarSeries,
    releaseBarSeries,
    setSeriesSummary,
    setTooltipPoint,
    xValues
  } = useCartesianChartContext();
  const { className, label, xCellId, yCellId } = props;
  const [seriesId, rawPoints] = useSeriesData(props);
  const barSeriesIndex = getBarSeriesIndex(seriesId);
  const [, , yMin, yMax] = bounds;
  const points = getScaledPoints(
    "bar",
    rawPoints,
    bounds,
    plotSize,
    xValues,
    xCellId,
    label ?? yCellId
  );
  useLayoutEffect(() => {
    setSeriesSummary(
      seriesId,
      getSeriesSummary("bar", rawPoints, xCellId, yCellId, label)
    );
  });
  useLayoutEffect(() => {
    registerBarSeries(seriesId);
    return () => releaseBarSeries(seriesId);
  }, [registerBarSeries, releaseBarSeries, seriesId]);
  return /* @__PURE__ */ jsx("g", {
    className: getSeriesClassName("bar-series", className),
    fill: CURRENT_COLOR,
    children: /* @__PURE__ */ jsx(Bars, {
      barGap,
      barSeriesCount,
      barSeriesIndex,
      plotFrame,
      points,
      setTooltipPoint,
      yMax,
      yMin
    })
  });
};
BarSeries[SERIES] = true;
var INTEGER = /^\d+$/;
var getPoolFunctions = () => {
  const pool = [];
  let nextId = 0;
  return [
    (reuse) => (reuse ? arrayShift(pool) : null) ?? EMPTY_STRING + nextId++,
    (id) => {
      if (test(INTEGER, id) && size(pool) < 1e3) {
        arrayPush(pool, id);
      }
    }
  ];
};
var DEFAULT_SIZE = [1e3, 1e3];
var DEFAULT_FONT_SIZE = 12;
var DEFAULT_STYLE = [0.5, 0.5, 0.25, 3.5, 4, 1, 1];
var useLayout = () => {
  const svgRef = useRef(null);
  const chartLayoutRef = useRef([
    DEFAULT_SIZE,
    getDefaultStyle(DEFAULT_FONT_SIZE)
  ]);
  const [chartLayout, setChartLayout] = useState([
    DEFAULT_SIZE,
    getDefaultStyle(DEFAULT_FONT_SIZE)
  ]);
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (isNull(svg)) {
      return;
    }
    const updateLayout = ({ contentRect }) => {
      const style = svg.ownerDocument.defaultView?.getComputedStyle(svg);
      const nextLayout = [getSvgSize(contentRect), getStyle(style)];
      if (!isLayoutEqual(chartLayoutRef.current, nextLayout)) {
        chartLayoutRef.current = nextLayout;
        setChartLayout(nextLayout);
      }
    };
    const observer = new ResizeObserver(([entry]) => updateLayout(entry));
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  return [svgRef, ...chartLayout];
};
var getPlotSize = ([, chartSize, chartStyle]) => {
  const [, , width, height] = getPlotFrame(chartSize, chartStyle);
  return [width, height];
};
var getLabelSize = ([, , chartStyle]) => chartStyle[6];
var getPlotFrame = ([width, height], [, , , xAxisHeight, yAxisWidth, inset, fontSize]) => {
  const plotX = inset + mathMax(mathMin(yAxisWidth, width / 2 - 2 * inset), 0);
  const plotY = inset + fontSize / 2;
  const plotRight = inset + fontSize / 2;
  const plotHeight = mathMax(
    height - plotY - mathMax(mathMin(xAxisHeight, height / 2 - plotY - inset), 0) - inset,
    0
  );
  return [plotX, plotY, mathMax(width - plotX - plotRight, 0), plotHeight];
};
var getDefaultStyle = (fontSize) => arrayMap(DEFAULT_STYLE, (value) => value * fontSize);
var getStyle = (style) => {
  const fontSize = parseFloat(style?.fontSize ?? "");
  return getDefaultStyle(
    isFiniteNumber(fontSize) ? fontSize : DEFAULT_FONT_SIZE
  );
};
var getSvgSize = ({ width, height }) => [
  mathRound(width) || DEFAULT_SIZE[0],
  mathRound(height) || DEFAULT_SIZE[1]
];
var isLayoutEqual = ([chartSize1, chartStyle1], [chartSize2, chartStyle2]) => arrayIsEqual(chartSize1, chartSize2) && arrayIsEqual(chartStyle1, chartStyle2);
var XAxis$1 = ({
  className,
  points,
  tickFormatter,
  xTicks,
  xMin,
  xMax,
  xTitle,
  plotFrame,
  tickSize,
  tickGap,
  axisHeight,
  fontSize
}) => {
  const [plotX, plotY, plotWidth, plotHeight] = plotFrame;
  const titleGap = mathMax(axisHeight - tickSize - tickGap - 2 * fontSize, 0);
  return /* @__PURE__ */ jsxs("g", {
    className: getAxisClassName$1("x", className),
    dominantBaseline: "hanging",
    textAnchor: "middle",
    children: [
      /* @__PURE__ */ jsx("path", {
        className: "line",
        d: `M${plotX},${plotY + plotHeight}h${plotWidth}`,
        fill: "none",
        stroke: CURRENT_COLOR,
        strokeOpacity: 0.5,
        strokeWidth: 1
      }),
      /* @__PURE__ */ jsx("g", {
        className: "ticks",
        children: arrayIsEmpty(xTicks) || !isNumber(xMin) || !isNumber(xMax) ? arrayMap(
          points,
          ([rowId, xValue, , x]) => /* @__PURE__ */ jsx(
            "text",
            {
              x: plotX + x,
              y: plotY + plotHeight + tickSize + tickGap,
              children: getTickLabel(xValue, tickFormatter)
            },
            rowId
          )
        ) : arrayMap(xTicks, (tick) => {
          const x = getScale(tick, xMin, xMax, plotWidth);
          return /* @__PURE__ */ jsx(
            "text",
            {
              x: plotX + x,
              y: plotY + plotHeight + tickSize + tickGap,
              children: getTickLabel(tick, tickFormatter)
            },
            tick
          );
        })
      }),
      /* @__PURE__ */ jsx("text", {
        className: "title",
        x: plotX + plotWidth / 2,
        y: plotY + plotHeight + tickSize + tickGap + fontSize + titleGap,
        children: xTitle
      })
    ]
  });
};
var getAxisClassName$1 = (baseClassName, className) => className == null ? baseClassName : `${baseClassName} ${className}`;
var getTickLabel = (tick, tickFormatter) => tickFormatter?.(tick) ?? string(tick);
var YAxis$1 = ({
  className,
  tickFormatter,
  yTicks,
  yMin,
  yMax,
  yTitle,
  plotFrame,
  tickSize,
  tickGap,
  axisWidth
}) => {
  const [plotX, plotY, , plotHeight] = plotFrame;
  return isNullish(yMin) || isNullish(yMax) ? null : /* @__PURE__ */ jsxs("g", {
    className: getAxisClassName("y", className),
    children: [
      /* @__PURE__ */ jsx("path", {
        className: "line",
        d: `M${plotX},${plotY}v${plotHeight}`,
        fill: "none",
        stroke: CURRENT_COLOR,
        strokeOpacity: 0.5,
        strokeWidth: 1
      }),
      /* @__PURE__ */ jsx("g", {
        className: "ticks",
        dominantBaseline: "middle",
        textAnchor: "end",
        children: arrayMap(yTicks, (tick) => {
          const y = plotHeight - getScale(tick, yMin, yMax, plotHeight);
          return /* @__PURE__ */ jsx(
            "text",
            {
              x: plotX - tickSize - tickGap,
              y: plotY + y,
              children: tickFormatter?.(tick) ?? string(tick)
            },
            tick
          );
        })
      }),
      /* @__PURE__ */ jsx("text", {
        className: "title",
        dominantBaseline: "text-before-edge",
        textAnchor: "middle",
        transform: `translate(${plotX - axisWidth} ${plotFrame[1] + plotFrame[3] / 2}) rotate(-90)`,
        children: yTitle
      })
    ]
  });
};
var getAxisClassName = (baseClassName, className) => className == null ? baseClassName : `${baseClassName} ${className}`;
var Axes = ({
  xAxis,
  yAxis,
  points,
  xTicks,
  yTicks,
  bounds: [xMin, xMax, yMin, yMax],
  titles: [xTitle, yTitle],
  xAxisHeight,
  yAxisWidth,
  fontSize,
  ...sharedProps
}) => {
  return /* @__PURE__ */ jsxs("g", {
    className: "axes",
    fill: CURRENT_COLOR,
    fillOpacity: 0.75,
    children: [
      /* @__PURE__ */ jsx(YAxis$1, {
        ...sharedProps,
        className: yAxis?.className,
        tickFormatter: yAxis?.tickFormatter,
        yTicks,
        yMin,
        yMax,
        yTitle,
        axisWidth: yAxisWidth
      }),
      /* @__PURE__ */ jsx(XAxis$1, {
        ...sharedProps,
        className: xAxis?.className,
        points,
        tickFormatter: xAxis?.tickFormatter,
        xTicks,
        xMin,
        xMax,
        xTitle,
        axisHeight: xAxisHeight,
        fontSize
      })
    ]
  });
};
var Grid = ({
  points,
  xTicks,
  yTicks,
  bounds: [xMin, xMax, yMin, yMax],
  plotFrame,
  tickSize
}) => {
  const [plotX, plotY, width, height] = plotFrame;
  return /* @__PURE__ */ jsxs("g", {
    className: "grid",
    stroke: CURRENT_COLOR,
    strokeOpacity: 0.75,
    strokeWidth: 0.5,
    children: [
      isNullish(yMin) || isNullish(yMax) ? null : /* @__PURE__ */ jsx("path", {
        className: "y",
        d: arrayJoin(
          arrayMap(
            arrayFilter(
              yTicks,
              (tick) => getScale(tick, yMin, yMax, height) != 0
            ),
            (tick) => `M${plotX - tickSize},${plotY + height - getScale(tick, yMin, yMax, height)}h${width + tickSize}`
          ),
          " "
        )
      }),
      arrayIsEmpty(xTicks) || !isNumber(xMin) || !isNumber(xMax) ? /* @__PURE__ */ jsx("path", {
        className: "x",
        d: arrayJoin(
          arrayMap(
            arrayFilter(points, ([, , , x]) => x != 0),
            ([, , , x]) => `M${plotX + x},${plotY}v${height + tickSize}`
          ),
          " "
        )
      }) : /* @__PURE__ */ jsx("path", {
        className: "x",
        d: arrayJoin(
          arrayMap(
            arrayFilter(
              xTicks,
              (tick) => getScale(tick, xMin, xMax, width) != 0
            ),
            (tick) => `M${plotX + getScale(tick, xMin, xMax, width)},${plotY}v${height + tickSize}`
          ),
          " "
        )
      })
    ]
  });
};
var TOOLTIP_WIDTH = 160;
var TOOLTIP_HEIGHT = 60;
var TOOLTIP_GAP = 12;
var TOOLTIP_PADDING = 12;
var TOOLTIP_BACKGROUND = "#111827";
var TOOLTIP_TEXT = "#fff";
var Tooltip = ({
  point,
  width,
  height,
  plotFrame,
  titles: [xTitle, yTitle]
}) => {
  if (isNullish(point)) {
    return null;
  }
  const [, xValue, yValue, x, y, pointXTitle, pointYTitle] = point;
  const [plotX, plotY] = plotFrame;
  const tooltipX = x + TOOLTIP_GAP + TOOLTIP_WIDTH > width ? x - TOOLTIP_GAP - TOOLTIP_WIDTH : x + TOOLTIP_GAP;
  const tooltipY = mathMax(
    mathMin(y - TOOLTIP_GAP - TOOLTIP_HEIGHT, height - TOOLTIP_HEIGHT),
    0
  );
  return /* @__PURE__ */ jsxs(Fragment$1, {
    children: [
      /* @__PURE__ */ jsx("path", {
        className: "tooltip-lines",
        pointerEvents: "none",
        stroke: CURRENT_COLOR,
        strokeOpacity: 0.25,
        strokeWidth: 1,
        d: `M${plotX + x},${plotY}v${height}M${plotX},${plotY + y}h${width}`
      }),
      /* @__PURE__ */ jsxs("g", {
        className: "tooltip",
        transform: `translate(${plotX + tooltipX} ${plotY + tooltipY})`,
        fontFamily: "sans-serif",
        fontWeight: 600,
        pointerEvents: "none",
        children: [
          /* @__PURE__ */ jsx("rect", {
            fill: TOOLTIP_BACKGROUND,
            fillOpacity: 0.9,
            width: TOOLTIP_WIDTH,
            height: TOOLTIP_HEIGHT,
            rx: 6
          }),
          /* @__PURE__ */ jsxs("text", {
            fill: TOOLTIP_TEXT,
            x: TOOLTIP_PADDING,
            y: 22,
            children: [pointXTitle ?? xTitle, ": ", string(xValue)]
          }),
          /* @__PURE__ */ jsxs("text", {
            fill: TOOLTIP_TEXT,
            x: TOOLTIP_PADDING,
            y: 46,
            children: [pointYTitle ?? yTitle, ": ", yValue]
          })
        ]
      })
    ]
  });
};
var EMPTY_DOMAIN_STATE = {
  bounds: [],
  continuousX: false,
  xValues: []
};
var CartesianChart = ({
  children,
  className,
  initialSummary,
  queries,
  queryId,
  store,
  tableId
}) => {
  const layout = useLayout();
  const [svgRef, chartSize, chartStyle] = layout;
  const [tickSize, tickGap, , xAxisHeight, yAxisWidth, , fontSize] = chartStyle;
  const plotFrame = getPlotFrame(chartSize, chartStyle);
  const plotSize = getPlotSize(layout);
  const labelSize = getLabelSize(layout);
  const storeObject = useStoreOrStoreById(store);
  const queriesObject = useQueriesOrQueriesById(queries);
  const sourceType = tableId == null ? queryId == null ? SourceType.None : SourceType.Query : SourceType.Table;
  const initialSummaries = initialSummary == null ? {} : { 0: initialSummary };
  const initialDomainState = initialSummary == null ? EMPTY_DOMAIN_STATE : getDomainState(objValues(initialSummaries));
  const initialXTitle = getTitle(initialSummaries, "xCellId");
  const initialYTitle = getTitle(initialSummaries, "yCellId");
  const summariesRef = useRef(initialSummaries);
  const boundsRef = useRef(initialDomainState.bounds);
  const domainStateRef = useRef(initialDomainState);
  const xTitleRef = useRef(initialXTitle);
  const yTitleRef = useRef(initialYTitle);
  const pool = useRef(getPoolFunctions());
  const [domainState, setDomainState] = useState(initialDomainState);
  const [xTitle, setXTitle] = useState(initialXTitle);
  const [yTitle, setYTitle] = useState(initialYTitle);
  const barSeriesIdsRef = useRef([]);
  const [barSeriesIds, setBarSeriesIds] = useState([]);
  const [tooltipPoint, setTooltipPoint] = useState();
  const [chartChildren, xAxis, yAxis] = getParsedChildren(children);
  const xValues = domainState.xValues;
  const numericX = domainState.continuousX || arrayIsEmpty(xValues) && hasNumericXAxisDefinition(xAxis);
  const dataBounds = getAxisBounds(domainState.bounds, numericX, xAxis, yAxis);
  const axisKind = numericX || arrayIsEmpty(barSeriesIds) ? "line" : "bar";
  const xTicks = numericX && xAxis?.ticks != null ? getAxisTicks(xAxis.ticks) : getXTicks(axisKind, dataBounds, plotSize, labelSize, xAxis?.tickCount);
  const yTicks = yAxis?.ticks == null ? getYTicks(dataBounds, plotSize, labelSize, yAxis?.tickCount) : getAxisTicks(yAxis.ticks);
  const tickBounds = getTickBounds(dataBounds, xTicks, yTicks);
  const axisPoints = getScaledPoints(
    axisKind,
    xValues.map((xValue, index) => [`${index}`, xValue, 0]),
    tickBounds,
    plotSize,
    xValues
  );
  const setNextDomainState = useCallback((summaryById) => {
    const nextDomainState = getDomainState(objValues(summaryById));
    const nextBounds = nextDomainState.bounds;
    if (!boundsAreEqual(boundsRef.current, nextBounds) || !arrayIsEqual(domainStateRef.current.xValues, nextDomainState.xValues)) {
      boundsRef.current = nextBounds;
      domainStateRef.current = nextDomainState;
      setDomainState(nextDomainState);
    }
  }, []);
  const setNextTitles = useCallback((summaryById) => {
    const nextXTitle = getTitle(summaryById, "xCellId");
    const nextYTitle = getTitle(summaryById, "yCellId");
    if (xTitleRef.current != nextXTitle) {
      xTitleRef.current = nextXTitle;
      setXTitle(nextXTitle);
    }
    if (yTitleRef.current != nextYTitle) {
      yTitleRef.current = nextYTitle;
      setYTitle(nextYTitle);
    }
  }, []);
  const setIncrementalDomainState = useCallback((summary) => {
    const currentBounds = boundsRef.current;
    const nextBounds = [
      getMin(currentBounds[0], summary.xMin),
      getMax(currentBounds[1], summary.xMax),
      getNumberMin(currentBounds[2], summary.yMin),
      getNumberMax(currentBounds[3], summary.yMax)
    ];
    if (!boundsAreEqual(currentBounds, nextBounds)) {
      boundsRef.current = nextBounds;
      domainStateRef.current = {
        bounds: nextBounds,
        continuousX: domainStateRef.current.continuousX,
        xValues: domainStateRef.current.xValues
      };
      setDomainState(domainStateRef.current);
    }
  }, []);
  const setSeriesSummary = useCallback(
    (seriesId, summary) => {
      const currentSummaries = summariesRef.current;
      const currentSummary = currentSummaries[seriesId];
      if (summary == null) {
        if (currentSummary == null) {
          return;
        }
        delete currentSummaries[seriesId];
        setNextTitles(currentSummaries);
        setNextDomainState(currentSummaries);
        return;
      }
      currentSummaries[seriesId] = summary;
      setNextTitles(currentSummaries);
      if (currentSummary == null ? addsXValues(summary.xValues, domainStateRef.current.xValues) || summary.continuousX != domainStateRef.current.continuousX : ownsBound(currentSummary, boundsRef.current) || currentSummary.continuousX != summary.continuousX || !arrayIsEqual(currentSummary.xValues, summary.xValues)) {
        setNextDomainState(currentSummaries);
        return;
      }
      setIncrementalDomainState(summary);
    },
    [setIncrementalDomainState, setNextDomainState, setNextTitles]
  );
  const [getId, releaseId] = pool.current;
  const getSeriesId = useCallback(() => getId(1), [getId]);
  const releaseSeriesId = useCallback(
    (seriesId) => {
      setSeriesSummary(seriesId, void 0);
      releaseId(seriesId);
    },
    [releaseId, setSeriesSummary]
  );
  const registerBarSeries = useCallback((seriesId) => {
    if (!arrayHas(barSeriesIdsRef.current, seriesId)) {
      const barSeriesIds2 = [...barSeriesIdsRef.current];
      arrayPush(barSeriesIds2, seriesId);
      barSeriesIdsRef.current = barSeriesIds2;
      setBarSeriesIds(barSeriesIds2);
    }
  }, []);
  const releaseBarSeries = useCallback((seriesId) => {
    if (arrayHas(barSeriesIdsRef.current, seriesId)) {
      const barSeriesIds2 = arrayFilter(
        barSeriesIdsRef.current,
        (barSeriesId) => barSeriesId != seriesId
      );
      barSeriesIdsRef.current = barSeriesIds2;
      setBarSeriesIds(barSeriesIds2);
    }
  }, []);
  const getBarSeriesIndex = useCallback(
    (seriesId) => arrayIndexOf(barSeriesIdsRef.current, seriesId),
    []
  );
  const context = useMemo(
    () => ({
      bounds: tickBounds,
      barSeriesCount: size(barSeriesIds),
      domainState,
      getBarSeriesIndex,
      getSeriesId,
      layout,
      plotFrame,
      plotSize,
      queries: queriesObject,
      queriesOrQueriesId: queries,
      queryId,
      registerBarSeries,
      releaseBarSeries,
      releaseSeriesId,
      setSeriesSummary,
      setTooltipPoint,
      sourceType,
      store: storeObject,
      storeOrStoreId: store,
      tableId,
      xTicks,
      xValues,
      yTicks
    }),
    [
      barSeriesIds,
      domainState,
      getBarSeriesIndex,
      getSeriesId,
      layout,
      plotFrame,
      plotSize,
      queries,
      queriesObject,
      queryId,
      registerBarSeries,
      releaseBarSeries,
      releaseSeriesId,
      setSeriesSummary,
      sourceType,
      store,
      storeObject,
      tableId,
      tickBounds,
      xTicks,
      xValues,
      yTicks
    ]
  );
  return /* @__PURE__ */ jsx(CartesianChartContext.Provider, {
    value: context,
    children: /* @__PURE__ */ jsxs("svg", {
      className,
      preserveAspectRatio: "none",
      ref: svgRef,
      viewBox: `0 0 ${chartSize[0]} ${chartSize[1]}`,
      children: [
        /* @__PURE__ */ jsx(Grid, {
          bounds: tickBounds,
          points: axisPoints,
          plotFrame,
          tickSize,
          xTicks,
          yTicks
        }),
        /* @__PURE__ */ jsx(Axes, {
          bounds: tickBounds,
          fontSize,
          points: axisPoints,
          plotFrame,
          tickGap,
          tickSize,
          titles: [xAxis?.title ?? xTitle, yAxis?.title ?? yTitle],
          xAxis,
          xAxisHeight,
          xTicks,
          yAxis,
          yAxisWidth,
          yTicks
        }),
        /* @__PURE__ */ jsx("g", { className: "plot", children: chartChildren }),
        /* @__PURE__ */ jsx(Tooltip, {
          height: plotSize[1],
          point: tooltipPoint,
          plotFrame,
          titles: [xAxis?.title ?? xTitle, yAxis?.title ?? yTitle],
          width: plotSize[0]
        })
      ]
    })
  });
};
var boundsAreEqual = (bounds1, bounds2) => bounds1[0] === bounds2[0] && bounds1[1] === bounds2[1] && bounds1[2] === bounds2[2] && bounds1[3] === bounds2[3];
var ownsBound = ({ xMin, xMax, yMin, yMax }, [boundXMin, boundXMax, boundYMin, boundYMax]) => xMin === boundXMin || xMax === boundXMax || yMin === boundYMin || yMax === boundYMax;
var addsXValues = (xValues, currentXValues) => {
  let adds = false;
  arrayForEach(xValues, (xValue) => {
    if (!arrayHas(currentXValues, xValue)) {
      adds = true;
    }
  });
  return adds;
};
var getMin = (value1, value2) => isNumber(value1) && isNumber(value2) ? mathMin(value1, value2) : value1 ?? value2;
var getMax = (value1, value2) => isNumber(value1) && isNumber(value2) ? mathMax(value1, value2) : value1 ?? value2;
var getNumberMin = (value1, value2) => value1 == null || value2 == null ? value1 ?? value2 : mathMin(value1, value2);
var getNumberMax = (value1, value2) => value1 == null || value2 == null ? value1 ?? value2 : mathMax(value1, value2);
var getTitle = (summaryById, cellIdType) => {
  const titles = [];
  arrayForEach(objValues(summaryById), (summary) => {
    const title = cellIdType == "yCellId" ? summary.yLabel ?? summary.yCellId : summary.xCellId;
    if (title != null && !arrayHas(titles, title)) {
      arrayPush(titles, title);
    }
  });
  return arrayIsEmpty(titles) ? "" : titles.join(" & ");
};
var getAxisBounds = ([xMin, xMax, yMin, yMax], numericX, xAxis, yAxis) => [
  numericX ? getAxisBound(xAxis?.min, xMin) : xMin,
  numericX ? getAxisBound(xAxis?.max, xMax) : xMax,
  getNumberAxisBound(yAxis?.min, yMin),
  getNumberAxisBound(yAxis?.max, yMax)
];
var getAxisBound = (value, bound) => isFiniteNumber(value) ? value : bound;
var getNumberAxisBound = (value, bound) => isFiniteNumber(value) ? value : bound;
var getAxisTicks = (ticks) => arraySort(arrayFilter([...ticks], isFiniteNumber), (tick1, tick2) => {
  return tick1 - tick2;
});
var hasNumericXAxisDefinition = (xAxis) => isFiniteNumber(xAxis?.min) || isFiniteNumber(xAxis?.max) || xAxis?.ticks != null;
var getParsedChildren = (children) => {
  const chartChildren = [];
  let xAxis;
  let yAxis;
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Fragment) {
        const [childChildren, childXAxis, childYAxis] = getParsedChildren(
          child.props.children
        );
        arrayForEach(
          childChildren,
          (chartChild) => arrayPush(chartChildren, chartChild)
        );
        xAxis ??= childXAxis;
        yAxis ??= childYAxis;
      } else if (isSeriesComponent(child.type)) {
        arrayPush(chartChildren, child);
      } else if (xAxis == null && isXAxisComponent(child.type)) {
        xAxis = child.props;
      } else if (yAxis == null && isYAxisComponent(child.type)) {
        yAxis = child.props;
      }
    }
  });
  return [chartChildren, xAxis, yAxis];
};
var useInitialSeriesSummary = (kind, {
  descending,
  limit,
  offset,
  queries,
  queryId,
  sortCellId,
  store,
  tableId,
  xCellId,
  yCellId
}) => {
  const storeObject = useStoreOrStoreById(store);
  const queriesObject = useQueriesOrQueriesById(queries);
  return useMemo(() => {
    const points = tableId == null ? getDataPoints(
      queriesObject?.getResultSortedRowIds(
        queryId ?? "",
        sortCellId ?? xCellId,
        descending,
        offset,
        limit
      ) ?? [],
      (rowId) => getDataPoint(
        rowId,
        queriesObject?.getResultCell(queryId ?? "", rowId, xCellId),
        queriesObject?.getResultCell(queryId ?? "", rowId, yCellId)
      )
    ) : getDataPoints(
      storeObject?.getSortedRowIds(
        tableId,
        sortCellId ?? xCellId,
        descending,
        offset,
        limit
      ) ?? [],
      (rowId) => getDataPoint(
        rowId,
        storeObject?.getCell(tableId, rowId, xCellId),
        storeObject?.getCell(tableId, rowId, yCellId)
      )
    );
    return getSeriesSummary(kind, points, xCellId, yCellId);
  }, [
    descending,
    kind,
    limit,
    offset,
    queriesObject,
    queryId,
    sortCellId,
    storeObject,
    tableId,
    xCellId,
    yCellId
  ]);
};
var BarChart = (props) => {
  const initialSummary = useInitialSeriesSummary("bar", props);
  return /* @__PURE__ */ jsx(CartesianChart, {
    ...getSourceProps$1(props),
    initialSummary,
    children: /* @__PURE__ */ jsx(BarSeries, { ...getSeriesProps$1(props) })
  });
};
var getSourceProps$1 = (props) => props.tableId == null ? {
  className: props.className,
  queries: props.queries,
  queryId: props.queryId
} : { className: props.className, store: props.store, tableId: props.tableId };
var getSeriesProps$1 = ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId
}) => ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId
});
var Line = ({ plotFrame, points, setTooltipPoint }) => {
  const [plotX, plotY, , height] = plotFrame;
  return /* @__PURE__ */ jsxs(Fragment$1, {
    children: [
      /* @__PURE__ */ jsx("path", {
        className: "area",
        d: getAreaPath(points, plotX, plotY, height),
        fill: CURRENT_COLOR,
        fillOpacity: 0.25,
        stroke: "none"
      }),
      /* @__PURE__ */ jsx("path", {
        className: "line",
        d: getLinePath(points, plotX, plotY),
        fill: "none",
        stroke: CURRENT_COLOR,
        strokeOpacity: 0.75,
        strokeWidth: 2
      }),
      /* @__PURE__ */ jsx("g", {
        className: "points",
        fill: CURRENT_COLOR,
        children: arrayMap(points, (point) => {
          const [rowId, , , x, y] = point;
          return /* @__PURE__ */ jsx(
            "circle",
            {
              cx: plotX + x,
              cy: plotY + y,
              onPointerEnter: () => setTooltipPoint(point),
              onPointerLeave: () => setTooltipPoint(void 0),
              r: 5
            },
            rowId
          );
        })
      })
    ]
  });
};
var getLinePath = (points, plotX, plotY) => arrayJoin(
  arrayMap(
    points,
    ([, , , x, y], index) => `${index == 0 ? "M" : "L"}${plotX + x},${plotY + y}`
  ),
  " "
);
var getAreaPath = (points, plotX, plotY, height) => arrayIsEmpty(points) ? "" : `${getLinePath(points, plotX, plotY)} L${plotX + points[size(points) - 1][3]},${plotY + height} L${plotX + points[0][3]},${plotY + height} Z`;
var LineSeries = (props) => {
  const {
    barSeriesCount,
    bounds,
    domainState,
    plotFrame,
    plotSize,
    setSeriesSummary,
    setTooltipPoint,
    xValues
  } = useCartesianChartContext();
  const { className, label, xCellId, yCellId } = props;
  const [seriesId, rawPoints] = useSeriesData(props);
  const points = getScaledPoints(
    domainState.continuousX || barSeriesCount == 0 ? "line" : "bar",
    rawPoints,
    bounds,
    plotSize,
    xValues,
    xCellId,
    label ?? yCellId
  );
  useLayoutEffect(() => {
    setSeriesSummary(
      seriesId,
      getSeriesSummary("line", rawPoints, xCellId, yCellId, label)
    );
  });
  return /* @__PURE__ */ jsx("g", {
    className: getSeriesClassName("line-series", className),
    children: /* @__PURE__ */ jsx(Line, {
      plotFrame,
      points,
      setTooltipPoint
    })
  });
};
LineSeries[SERIES] = true;
var LineChart = (props) => {
  const initialSummary = useInitialSeriesSummary("line", props);
  return /* @__PURE__ */ jsx(CartesianChart, {
    ...getSourceProps(props),
    initialSummary,
    children: /* @__PURE__ */ jsx(LineSeries, { ...getSeriesProps(props) })
  });
};
var getSourceProps = (props) => props.tableId == null ? {
  className: props.className,
  queries: props.queries,
  queryId: props.queryId
} : { className: props.className, store: props.store, tableId: props.tableId };
var getSeriesProps = ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId
}) => ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId
});
var XAxis = () => null;
XAxis[X_AXIS] = true;
var YAxis = () => null;
YAxis[Y_AXIS] = true;
export {
  BarChart,
  BarSeries,
  CartesianChart,
  LineChart,
  LineSeries,
  XAxis,
  YAxis
};
