# Breakdown Chart (Pro)

Stacked bar chart with measure, slice and segment pickers, a hover breakdown and a linked table

- Page: https://www.affectui.com/components/breakdown-chart
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/breakdown-chart.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/breakdown-chart-clean.json` (needs the Pro access key) – lands as `breakdown-chart-clean.tsx`, import from `@/components/ui/breakdown-chart-clean` – its docs: `breakdown-chart-clean.md`
- Import: `@/components/ui/breakdown-chart`

### When to use

- Showing how a set of records splits up – tasks by status and priority, tickets by team, orders by region
- Reports where people want to switch the view themselves without leaving the page

### When not to use

- Values over time – use the KPI Chart
- More than about twelve bars or eight segments – the bars and the legend get hard to read

### Usage

```tsx
import { BreakdownChart } from "@/components/ui/breakdown-chart";

const dimensions = [
  { key: "status", label: "Status", values: ["Todo", "In progress", "Done"] },
  { key: "priority", label: "Priority", values: ["High", "Medium", "Low"], colors: { High: "#e5484d" } },
];
const measures = [
  { key: "count", label: "Task count", unit: "tasks" },
  { key: "points", label: "Story points", unit: "points", field: "points" },
];

export function Sprint({ tasks }) {
  return <BreakdownChart title="Sprint 24" records={tasks} dimensions={dimensions} measures={measures} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| records | `BreakdownRecord[]` |  | Flat records – one per task, ticket or order – with a field per dimension |
| dimensions | `Dimension[]` |  | key, label, values in order, optional colors and icons per value |
| measures | `Measure[]` |  | key, label, unit and the field to sum – without a field records are counted |
| title | `string` | `"Workload"` | Heading in the gray tray |
| defaultMeasure | `string` |  | Measure shown first |
| defaultSlice | `string` |  | Dimension along the bars |
| defaultSegment | `string` |  | Dimension that stacks the bars, or "none" |
| className | `string` |  | Extra class on the tray |

### Keyboard

- Tab: Move through the pickers, the bars and the legend
- ↑ / ↓: Move through an open picker
- Escape: Close a picker

### Accessibility

- Each bar is a button that reads its slice and total; focusing it shows the breakdown
- The table repeats every number, so nothing depends on color or hover
- Legend entries are toggle buttons with a pressed state

### Motion

- Bars grow and re-stack smoothly when the measure, slice or segment changes
- Hovering dims the other bars and highlights the matching table row; reduced motion turns transitions off

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: kpi-chart, data-table, change-summary
