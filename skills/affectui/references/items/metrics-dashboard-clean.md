# Metrics Dashboard, clean style (Pro)

Sales overview – KPI cards pick the metric, one chart switches between dotted line and bars, with top products and channels

- Page: https://www.affectui.com/blocks/metrics-dashboard
- Section: Blocks · Analytics
- Install: `npx shadcn@latest add https://www.affectui.com/r/metrics-dashboard-clean.json` (needs the Pro access key)
- Import: `@/components/ui/metrics-dashboard-clean`

### When to use

- A compact sales or business overview with a handful of headline metrics
- Dashboards where one chart, picked by KPI cards and shown as a line or as bars, says more than a grid of small charts

### When not to use

- Large data sets or drill-downs – the chart shows up to 30 points per period
- A single number – use a KPI card instead

### Usage

```tsx
import { MetricsDashboard } from "@/components/ui/metrics-dashboard-clean";

export function Overview({ days, products, channels }) {
  return (
    <MetricsDashboard
      title="Sales"
      site="Northwind Store"
      data={days} // [{ date, revenue, orders, refunded }, …] oldest first
      products={products} // [{ name: "Linen overshirt", share: 0.22 }, …]
      channels={channels}
      currency="USD"
      defaultRange="30d"
      onExport={(range, metric) => console.log("export", range, metric)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | `"Sales"` | Title in the bar on top |
| site | `string` | `"Northwind Store"` | Site or workspace shown under the title |
| defaultRange | `"7d" \| "30d" \| "90d"` | `"30d"` | Period to start on – shown as Week, Month and Quarter |
| defaultMetric | `"revenue" \| "orders" \| "aov" \| "refunds"` | `"revenue"` | Metric to start on |
| onExport | `(range, metric) => void` |  | Called when Export is pressed; the button confirms locally either way |
| data | `{ date: Date; revenue; orders; refunded }[]` | `sample data` | One entry per day, oldest first; 180 days give every range a previous period. Days missing a number count as 0; without a previous period the change chips stay empty |
| products | `{ name: string; share: number }[]` | `sample products` | Rows of Top products with their share of revenue (0–1); bars are relative to the largest share. An empty list shows a short note |
| channels | `{ name: string; share: number }[]` | `sample channels` | Rows of Channels, like products |
| currency | `string` | `"USD"` | ISO currency code for revenue, average order and the axis |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the period switch, Export, the KPI cards, the chart type, Compare and the chart
- ← / →: With the chart focused, moves the inspected point
- Home / End: Jumps to the first or last point

### Accessibility

- Period and chart-type buttons use aria-pressed; the KPI cards are tabs with aria-selected
- The chart has a text label with the range and values; the inspected point is announced through a status tooltip
- Changes are small tinted badges with an arrow that also say up or down in text, so they don't rely on color alone – and a falling refund rate counts as good

### Motion

- KPI values and list counts count to their new amounts with tabular numerals
- The chosen KPI card turns fully opaque while the others dim; the line draws in with its dots popping on, bars grow up one after another
- With prefers-reduced-motion values and views switch instantly

### Responsive

- Follows the block's own width with container queries: below 640px the KPI cards form a 2 × 2 grid and the two list cards stack
- On touch screens the buttons, segmented tracks, the Compare switch and the list rows grow to larger targets
- Below 460px the period switch fills the width, figures shrink and the chart is 168px tall
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
