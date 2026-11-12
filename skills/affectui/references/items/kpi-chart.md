# KPI Chart (Pro)

Metric card with a multi-line chart and a tooltip that follows the pointer

- Page: https://www.affectui.com/components/kpi-chart
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/kpi-chart.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/kpi-chart-clean.json` (needs the Pro access key) – lands as `kpi-chart-clean.tsx`, import from `@/components/ui/kpi-chart-clean` – its docs: `kpi-chart-clean.md`
- Import: `@/components/ui/kpi-chart`

### When to use

- Dashboards that show one headline number and how its parts moved over a short period
- Comparing a handful of channels, pages or plans day by day

### When not to use

- More than about six lines – the chart and the tooltip get hard to read
- Long time ranges with hundreds of points – use a chart library with zoom and sampling

### Usage

```tsx
import { KpiChart } from "@/components/ui/kpi-chart";

export function Revenue() {
  return (
    <KpiChart
      title="Revenue"
      value="$96.4k"
      delta={7900}
      format={(n) => `$${(n / 1000).toFixed(1)}k`}
      labels={["Mar 3", "Mar 4", "Mar 5"]}
      series={[
        { label: "Organic", color: "#2f6bff", values: [4600, 4900, 5200] },
        { label: "Paid ads", color: "#ec4899", values: [3100, 3400, 3200] },
      ]}
      footer="Top channels"
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | Label above the number |
| value | `string` |  | Headline value, already formatted |
| delta | `number` |  | Change against the previous period – green when positive, red when negative |
| labels | `string[]` |  | One label per point; first, middle and last are shown on the axis |
| tooltipLabels | `string[]` |  | Longer labels for the tooltip header, falls back to labels |
| series | `KpiSeries[]` |  | Lines with a label, a color and one value per label |
| format | `(n: number) => string` | `compact, e.g. 1.2k` | Formats axis, tooltip and delta values |
| footer | `string` |  | Line under the chart |
| defaultIndex | `number` |  | Point that stays highlighted while nobody hovers |
| emptyText | `string` | `"No data yet"` | Quiet text in the plot when there are no values, or only zeros (0% on a percent axis still draws) |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Focus the chart
- ← / →: Move to the previous or next point
- Esc: Close the tooltip

### Accessibility

- The chart is focusable and readable with the arrow keys
- The tooltip is a polite live region, so screen readers announce the values of the current point

### Motion

- Lines draw in from the left on mount
- Guide, dots and tooltip glide between points; reduced motion turns this off

### Responsive

- The card fills its container up to 460px; the plot scales, line widths stay crisp
- Touch works too – tap or drag across the chart
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: progress-tracker
