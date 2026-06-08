# <LineChart /> (Styled)

![Styled Chart](/shots/styled-chart-react-demo.png)

In this demo, we apply CSS to a LineChart component to show how all its visual
aspects can be styled.

Rather than building the whole demo and boilerplate from scratch, we're making
changes to the <LineChart /> demo to show how the SVG output can be
customized.

[base]: # '<LineChart />'

## Styling The Chart Frame

First, we make the page feel a little more like a focused data panel:

```diff-less
 .chart {
+  background: #f6f8fb;
+  border: 1px solid #d9e2ec;
+  border-radius: 0.5rem;
+  box-shadow: 0 0.75rem 2rem #26364a1a;
+  color: #1f2937;
   display: block;
   font-size: 12px;
   height: 20rem;
+  padding: 1rem;
   width: 100%;
 }
```

## Styling Axes And Grid Lines

Chart components use `currentColor` by default, so setting `color` on the chart
affects most of the SVG. More specific selectors can then tune grid lines, axes,
tick labels, and axis titles:

```less
.chart {
  .grid {
    color: #d8e1eb;
    stroke-dasharray: 4 6;
  }

  .axes {
    color: #677489;

    .title {
      fill: #1f2937;
      font-weight: 700;
    }
  }
}
```

## Styling The Data

The plotted data also uses regular SVG class names. For a line chart, that
means we can style the filled area, line, and point markers independently:

```less
.chart {
  .plot {
    .area {
      fill: #0ea5e9;
      fill-opacity: 0.12;
    }

    .line {
      stroke: #0284c7;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-opacity: 1;
      stroke-width: 3;
    }

    .points {
      fill: white;
      stroke: #0284c7;
      stroke-width: 2;
    }
  }
}
```

## Styling The Tooltip

Hover over points in the chart and a tooltip appears. That is just more SVG,
and can be styled too:

```less
.chart {
  .tooltip-lines {
    stroke: #0284c7;
    stroke-dasharray: 3 3;
    stroke-opacity: 0.35;
  }

  .tooltip {
    font-weight: 700;

    rect {
      fill: #172033;
      fill-opacity: 0.94;
    }

    text {
      fill: white;
    }
  }
}
```

And that's a styled chart with no additional chart props. The component handles
reactive data and geometry, while CSS handles the presentation.

Next, the [Composing Charts](/demos/chart-components-react/composing-charts/)
demo shows how CartesianChart component can combine multiple series in one SVG.
