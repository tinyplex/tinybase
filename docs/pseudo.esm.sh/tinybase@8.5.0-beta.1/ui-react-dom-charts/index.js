// dist/ui-react-dom-charts/index.js
import React from "https://esm.sh/react@^19.2.6";
import { Fragment, jsx, jsxs } from "https://esm.sh/react@^19.2.6/jsx-runtime";
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
var ifNotNullish = getIfNotFunction(isNullish);
var ifNotUndefined = getIfNotFunction(isUndefined);
var isString = (thing) => getTypeOf(thing) == STRING;
var isNumber = (thing) => getTypeOf(thing) == NUMBER;
var isArray = (thing) => Array.isArray(thing);
var size = (arrayOrString) => arrayOrString.length;
var arrayNew = (size2, cb) => arrayMap(new Array(size2).fill(0), (_, index) => cb(index));
var arrayIndexOf = (array, value) => array.indexOf(value);
var arrayEvery = (array, cb) => array.every(cb);
var arrayIsEqual = (array1, array2) => size(array1) === size(array2) && arrayEvery(array1, (value1, index) => array2[index] === value1);
var arrayOrValueEqual = (value1, value2) => isArray(value1) && isArray(value2) ? arrayIsEqual(value1, value2) : value1 === value2;
var arrayForEach = (array, cb) => array.forEach(cb);
var arrayJoin = (array, sep = EMPTY_STRING) => array.join(sep);
var arrayMap = (array, cb) => array.map(cb);
var arrayIsEmpty = (array) => size(array) == 0;
var arrayFilter = (array, cb) => array.filter(cb);
var {
  PureComponent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} = React;
var DEFAULT_SIZE = [1e3, 1e3];
var DEFAULT_FONT_SIZE = 12;
var DEFAULT_STYLE = [0.5, 0.5, 0.25, 3.5, 4, 1, 1];
var useLayout = () => {
  const svgRef = useRef(null);
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
      setChartLayout(
        (chartLayout2) => isLayoutEqual(chartLayout2, nextLayout) ? chartLayout2 : nextLayout
      );
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
var CURRENT_COLOR = "currentColor";
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
var getScaledPoints = (kind, points, [xMin, xMax, yMin, yMax], [width, height]) => {
  const numericX = kind == "line" && arrayIsEmpty(arrayFilter(points, ([, xValue]) => !isNumber(xValue)));
  const xDomain = numericX ? [xMin, xMax] : [0, 0];
  const yDomain = [yMin ?? 0, yMax ?? 0];
  const xCategories = /* @__PURE__ */ new Map();
  arrayForEach(points, ([, xValue]) => {
    if (!xCategories.has(xValue)) {
      xCategories.set(xValue, collSize(xCategories));
    }
  });
  return arrayMap(points, ([rowId, xValue, yValue]) => [
    rowId,
    xValue,
    yValue,
    getX(xValue, numericX, xDomain, xCategories, width, kind),
    getY(yValue, yDomain, height)
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
var getYTicks = ([, , yMin, yMax], [, height], labelSize) => {
  if (isUndefined(yMin) || isUndefined(yMax)) {
    return [];
  }
  if (yMin == yMax) {
    return [yMin];
  }
  return getTicks(
    yMin,
    yMax,
    TARGET_TICKS,
    labelSize,
    height,
    isInteger(yMin) && isInteger(yMax)
  );
};
var getXTicks = (kind, [xMin, xMax], [width], labelSize) => kind == "line" && isNumber(xMin) && isNumber(xMax) && xMin != xMax ? getTicks(
  xMin,
  xMax,
  TARGET_TICKS,
  labelSize,
  width,
  isInteger(xMin) && isInteger(xMax)
) : [];
var getTickBounds = ([xMin, xMax, yMin, yMax], xTicks, yTicks) => [
  arrayIsEmpty(xTicks) ? xMin : mathMin(xMin, xTicks[0]),
  arrayIsEmpty(xTicks) ? xMax : mathMax(xMax, xTicks[size(xTicks) - 1]),
  arrayIsEmpty(yTicks) ? yMin : mathMin(yMin ?? infinity, yTicks[0]),
  arrayIsEmpty(yTicks) ? yMax : mathMax(yMax ?? -infinity, yTicks[size(yTicks) - 1])
];
var getYDomain = (points, kind = "bar") => getDomain([
  ...kind == "bar" ? [0] : [],
  ...arrayMap(points, ([, , yValue]) => yValue)
]);
var getDomain = (values) => {
  const min = mathMin(...values);
  return min == infinity ? [0, 0] : [min, mathMax(...values)];
};
var getRounded = (value) => mathRound(value * 1e6) / 1e6;
var getXValue = (cell) => isNumber(cell) ? isFiniteNumber(cell) ? cell : void 0 : isString(cell) ? cell : void 0;
var getYValue = (cell) => isNumber(cell) && isFiniteNumber(cell) ? cell : void 0;
var XAxis = ({
  points,
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
    className: "x",
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
              children: xValue
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
              children: tick
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
var YAxis = ({
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
    className: "y",
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
            { x: plotX - tickSize - tickGap, y: plotY + y, children: tick },
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
var Axes = ({
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
      /* @__PURE__ */ jsx(YAxis, {
        ...sharedProps,
        yTicks,
        yMin,
        yMax,
        yTitle,
        axisWidth: yAxisWidth
      }),
      /* @__PURE__ */ jsx(XAxis, {
        ...sharedProps,
        points,
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
var Marks = ({ getMark, points, setTooltipPoint }) => arrayMap(points, (point, index) => {
  const [rowId] = point;
  return /* @__PURE__ */ jsx(
    "g",
    {
      onPointerEnter: () => setTooltipPoint(point),
      onPointerLeave: () => setTooltipPoint(void 0),
      children: getMark(point, index)
    },
    rowId
  );
});
var Bars = ({
  points,
  plotFrame,
  barGap,
  setTooltipPoint,
  yMin = 0,
  yMax = 0
}) => {
  const [plotX, plotY, width, height] = plotFrame;
  const baselineY = height - getScale(0, yMin, yMax, height);
  const pointsSize = size(points);
  const fullBarWidth = arrayIsEmpty(points) ? 0 : width / pointsSize;
  const barWidth = arrayIsEmpty(points) ? 0 : mathMax(fullBarWidth - barGap, 0);
  return /* @__PURE__ */ jsx(Marks, {
    points,
    getMark: ([, , , x, pointY]) => {
      const y = mathMin(pointY, baselineY);
      return /* @__PURE__ */ jsx("rect", {
        className: "bar",
        fill: CURRENT_COLOR,
        x: plotX + x - barWidth / 2,
        y: plotY + y,
        width: barWidth,
        height: mathAbs(baselineY - pointY)
      });
    },
    setTooltipPoint
  });
};
var Line = ({ plotFrame, points, setTooltipPoint }) => {
  const [plotX, plotY, , height] = plotFrame;
  return /* @__PURE__ */ jsxs(Fragment, {
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
var Plot = ({
  kind,
  points,
  plotFrame,
  barGap,
  setTooltipPoint,
  bounds: [, , yMin, yMax]
}) => {
  const sharedProps = { points, setTooltipPoint };
  return /* @__PURE__ */ jsx("g", {
    className: "plot",
    children: kind == "line" ? /* @__PURE__ */ jsx(Line, { ...sharedProps, plotFrame }) : /* @__PURE__ */ jsx(Bars, {
      ...sharedProps,
      plotFrame,
      barGap,
      yMin,
      yMax
    })
  });
};
var TOOLTIP_WIDTH = 160;
var TOOLTIP_HEIGHT = 60;
var TOOLTIP_GAP = 12;
var TOOLTIP_PADDING = 12;
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
  const [, xValue, yValue, x, y] = point;
  const [plotX, plotY] = plotFrame;
  const tooltipX = x + TOOLTIP_GAP + TOOLTIP_WIDTH > width ? x - TOOLTIP_GAP - TOOLTIP_WIDTH : x + TOOLTIP_GAP;
  const tooltipY = mathMax(
    mathMin(y - TOOLTIP_GAP - TOOLTIP_HEIGHT, height - TOOLTIP_HEIGHT),
    0
  );
  return /* @__PURE__ */ jsxs(Fragment, {
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
        fill: CURRENT_COLOR,
        children: [
          /* @__PURE__ */ jsx("rect", {
            fillOpacity: 0.25,
            width: TOOLTIP_WIDTH,
            height: TOOLTIP_HEIGHT,
            rx: 4
          }),
          /* @__PURE__ */ jsxs("text", {
            x: TOOLTIP_PADDING,
            y: 22,
            children: [xTitle, ": ", xValue]
          }),
          /* @__PURE__ */ jsxs("text", {
            x: TOOLTIP_PADDING,
            y: 46,
            children: [yTitle, ": ", yValue]
          })
        ]
      })
    ]
  });
};
var Layout = ({
  className,
  kind,
  titles,
  layout: [svgRef, chartSize, chartStyle],
  ...sharedProps
}) => {
  const [width, height] = chartSize;
  const plotFrame = getPlotFrame(chartSize, chartStyle);
  const [, , plotWidth, plotHeight] = plotFrame;
  const [tickSize, tickGap, barGap, xAxisHeight, yAxisWidth, , fontSize] = chartStyle;
  const [tooltipPoint, setTooltipPoint] = useState();
  const chartProps = { ...sharedProps, plotFrame };
  return /* @__PURE__ */ jsxs("svg", {
    className,
    preserveAspectRatio: "none",
    ref: svgRef,
    viewBox: `0 0 ${width} ${height}`,
    children: [
      /* @__PURE__ */ jsx(Grid, { ...chartProps, tickSize }),
      /* @__PURE__ */ jsx(Axes, {
        ...chartProps,
        titles,
        tickSize,
        tickGap,
        xAxisHeight,
        yAxisWidth,
        fontSize
      }),
      /* @__PURE__ */ jsx(Plot, {
        ...chartProps,
        kind,
        barGap,
        setTooltipPoint
      }),
      /* @__PURE__ */ jsx(Tooltip, {
        point: tooltipPoint,
        width: plotWidth,
        height: plotHeight,
        plotFrame,
        titles
      })
    ]
  });
};
var EmptyChart = ({ className, kind, xCellId, yCellId }) => {
  const layout = useLayout();
  return /* @__PURE__ */ jsx(Layout, {
    className,
    kind,
    points: [],
    bounds: [],
    titles: [xCellId, yCellId],
    xTicks: [],
    yTicks: [],
    layout
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
var useData = (kind, rowIds, chartSize, labelSize, getXCell, getYCell) => {
  const [, rerender] = useState();
  const handleChange = useCallback(() => rerender([]), [rerender]);
  const points = getDataPoints(
    rowIds,
    (rowId) => getDataPoint(rowId, getXCell(rowId), getYCell(rowId))
  );
  const dataBounds = getBounds(kind, points);
  const xTicks = getXTicks(kind, dataBounds, chartSize, labelSize);
  const yTicks = getYTicks(dataBounds, chartSize, labelSize);
  const bounds = getTickBounds(dataBounds, xTicks, yTicks);
  return [
    handleChange,
    getScaledPoints(kind, points, bounds, chartSize),
    bounds,
    xTicks,
    yTicks
  ];
};
var QueryChart = ({
  descending,
  className,
  kind,
  limit,
  offset,
  queriesOrQueriesId,
  queryId,
  sortCellId,
  xCellId,
  yCellId
}) => {
  const layout = useLayout();
  const queries = useQueriesOrQueriesById(queriesOrQueriesId);
  const rowIds = useResultSortedRowIds(
    queryId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    queriesOrQueriesId
  );
  const [handleChange, points, bounds, xTicks, yTicks] = useData(
    kind,
    rowIds,
    getPlotSize(layout),
    getLabelSize(layout),
    (rowId) => queries?.getResultCell(queryId, rowId, xCellId),
    (rowId) => queries?.getResultCell(queryId, rowId, yCellId)
  );
  useResultCellListener(
    queryId,
    null,
    xCellId,
    handleChange,
    [handleChange],
    queries
  );
  useResultCellListener(
    queryId,
    null,
    yCellId,
    handleChange,
    [handleChange],
    queries
  );
  return /* @__PURE__ */ jsx(Layout, {
    className,
    kind,
    points,
    bounds,
    titles: [xCellId, yCellId],
    xTicks,
    yTicks,
    layout
  });
};
var TableChart = ({
  descending,
  className,
  kind,
  limit,
  offset,
  sortCellId,
  storeOrStoreId,
  tableId,
  xCellId,
  yCellId
}) => {
  const layout = useLayout();
  const store = useStoreOrStoreById(storeOrStoreId);
  const rowIds = useSortedRowIds(
    tableId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    storeOrStoreId
  );
  const [handleChange, points, bounds, xTicks, yTicks] = useData(
    kind,
    rowIds,
    getPlotSize(layout),
    getLabelSize(layout),
    (rowId) => store?.getCell(tableId, rowId, xCellId),
    (rowId) => store?.getCell(tableId, rowId, yCellId)
  );
  useCellListener(
    tableId,
    null,
    xCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId
  );
  useCellListener(
    tableId,
    null,
    yCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId
  );
  return /* @__PURE__ */ jsx(Layout, {
    className,
    kind,
    points,
    bounds,
    titles: [xCellId, yCellId],
    xTicks,
    yTicks,
    layout
  });
};
var Chart = ({ className, store, tableId, queries, queryId, ...props }) => isUndefined(tableId) ? isUndefined(queryId) ? /* @__PURE__ */ jsx(EmptyChart, { ...props, className }) : /* @__PURE__ */ jsx(QueryChart, {
  ...props,
  className,
  queriesOrQueriesId: queries,
  queryId
}) : /* @__PURE__ */ jsx(TableChart, {
  ...props,
  className,
  storeOrStoreId: store,
  tableId
});
var BarChart = (props) => /* @__PURE__ */ jsx(Chart, { ...props, kind: "bar" });
var LineChart = (props) => /* @__PURE__ */ jsx(Chart, { ...props, kind: "line" });
export {
  BarChart,
  LineChart
};
