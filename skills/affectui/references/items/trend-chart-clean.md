# Trend Chart, clean style (Pro)

The chart on its own for any card or layout – line, area, bars or a sparkline from the same data, with a tooltip, this period against the last, and charts that follow the same day together

- Page: https://www.affectui.com/components/trend-chart
- Section: Components · Data display
- Install: `npx shadcn@latest add https://www.affectui.com/r/trend-chart-clean.json` (needs the Pro access key)
- Import: `@/components/ui/trend-chart-clean`

### When to use

- Any chart inside your own card, KPI tile, table row or dashboard layout – it brings no card of its own
- Values over time: a line, an area, bars per day, or a small sparkline next to a number
- This period against the last – mark a series as previous and it is drawn dashed or faint
- A row of charts that should read the same day together – share `index` between them

### When not to use

- More than about six series – the chart and the tooltip get hard to read
- Long time ranges with hundreds of points – use a chart library with zoom and sampling
- Parts of a whole – use Breakdown Chart or Model Usage

### Usage

```tsx
import { TrendChart } from "@/components/ui/trend-chart-clean";

export function Spend() {
  return (
    <TrendChart
      variant="area"
      label="Spend per day"
      labels={["Mar 3", "Mar 4", "Mar 5", "Mar 6"]}
      format={(n) => `$${Math.round(n)}`}
      series={[
        { label: "This week", values: [412, 455, 398, 470] },
        { label: "Last week", values: [356, 380, 371, 390], previous: true },
      ]}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| labels | `string[]` |  | One label per point; first, middle and last are shown on the axis |
| tooltipLabels | `string[]` |  | Longer labels for the tooltip header, falls back to labels |
| series | `TrendSeries[]` |  | { label, values, color?, previous? } – values line up with labels, null leaves a gap; previous draws it dashed (line) or faint (bar) |
| variant | `"line" \| "area" \| "bar" \| "sparkline"` | `"line"` | How the same data is drawn – a sparkline has no axes and a small tag instead of the tooltip |
| format | `(n: number) => string` | `compact, e.g. 1.2k` | Formats tooltip values – and the axis, unless axisFormat is set |
| axisFormat | `(n: number) => string` |  | Shorter numbers for the axis, e.g. "$1.6T" while the tooltip shows the full amount |
| height | `number` | `152 (sparkline 40)` | Height of the plot in px |
| axis | `boolean \| "x"` | `true (sparkline false)` | Value labels on the left and dates below, only the dates ("x"), or none – without axes a small tag replaces the tooltip |
| tooltip | `boolean` | `true` | The popover or tag with the values – off when the card shows the value itself; the point stays marked |
| zero | `boolean` | `true` | Start the value axis at zero; false zooms in around the values for averages and rates (bars always start at zero) |
| index | `number \| null` |  | The highlighted point, controlled – share it between charts so they move together |
| onIndexChange | `(index: number \| null) => void` |  | Called when the pointer or the keys move to another point, or leave |
| defaultIndex | `number` |  | Point that stays highlighted while nobody hovers |
| label | `string` | `"Chart"` | Name for screen readers |
| emptyText | `string` | `"No data yet"` | Quiet text in the plot when there are no values, or only zeros |
| className | `string` |  | Extra class on the chart |

### Keyboard

- Tab: Focus the chart
- ← / →: Move to the previous or next point
- Home / End: Jump to the first or last point
- Esc: Close the tooltip

### Accessibility

- The chart is one focusable stop, readable with the arrow keys
- The tooltip is a polite live region, so screen readers announce the values of the current point

### Motion

- Lines and fills draw in from the left, bars grow out of the zero line on first view
- New data glides: every point and bar eases from where it was to its new place, also between ranges of different length
- Guide, dots and tooltip move between points in a short, crisp step; reduced motion turns all of it off

### Responsive

- Fills the width of its container; the plot scales, line widths stay crisp
- Below 320px the middle date steps aside; below 240px tooltip values move under their names
- Touch works too – tap or drag across the chart
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: kpi-chart, breakdown-chart, model-usage
