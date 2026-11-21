# Metering Chart (Pro)

Usage per day as soft gradient bars drifting from blue to lilac, with a live bar for today that keeps growing, a Real-time badge and rolling totals

- Page: https://www.affectui.com/components/metering-chart
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/metering-chart.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/metering-chart-clean.json` (needs the Pro access key) – lands as `metering-chart-clean.tsx`, import from `@/components/ui/metering-chart-clean` – its docs: `metering-chart-clean.md`
- Import: `@/components/ui/metering-chart`

### When to use

- Usage-based billing and metering – API calls, tokens, events, minutes per day
- A usage card where today is still counting and should look alive
- A calm daily bar chart that reads as a whole, with totals above it
- Showing what a day was made of – calls per tool, tokens per model – in percent on hover

### When not to use

- Comparing series or periods – use Trend Chart
- Hundreds of days – the bars get too thin; group them into weeks first

### Usage

```tsx
import { MeteringChart } from "@/components/ui/metering-chart";

export function ApiCalls() {
  return (
    <MeteringChart
      title="API calls"
      live
      period="Sep 1 – Sep 21"
      data={[
        { label: "Sep 1", value: 1870 },
        { label: "Sep 2", value: 2290 },
        { label: "Sep 3", value: 2860 },
      ]}
      totals={[
        { label: "Total volume", value: 50390, format: (n) => `$${Math.round(n).toLocaleString()}` },
        { label: "Total events", value: 36000 },
      ]}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | Heading of the card |
| data | `MeteringDay[]` |  | { label, value, breakdown? } per day, oldest first; a missing or broken value leaves an empty slot. breakdown: { label, value, logo? }[] – shown with its logo in the tag as whole percentages that add up to 100, largest first |
| totals | `MeteringTotal[]` |  | { label, value, format? } – figures under the title that roll to their new values |
| period | `string` |  | The span on the right, e.g. "Sep 1 – Sep 21" |
| live | `boolean` | `false` | The last bar is today and still counting: accent color, a running sheen, a turning spinner in the pink badge |
| badge | `string` | `"Real-time" when live` | Text next to the title; empty for none |
| format | `(n: number) => string` | `1,284` | Formats the tag and the totals |
| axisFormat | `(n: number) => string` |  | Shorter numbers for the value axis, e.g. 4.5k |
| colors | `string[]` | `light blue → lilac → mauve` | Colors the bars drift through from left to right |
| accent | `string` | `"#5e5cff"` | Color of the live bar |
| height | `number` | `168` | Height of the plot in px |
| emptyText | `string` | `"No usage yet"` | Quiet text when there is nothing to draw |
| breakdownLimit | `number` | `4` | How many parts the tag lists – the smaller ones fold into one row |
| otherLabel | `string` | `"Other"` | Label of the folded row |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Focus the chart
- ← / →: Move to the previous or next day
- Home / End: Jump to the first day or today
- Esc: Close the tag

### Accessibility

- The chart is one focusable stop, readable with the arrow keys; the tag is a polite live region
- Totals are read out with their final value, never a number on its way
- The breakdown is part of the tag's text, so it is read out with the day

### Motion

- With a breakdown the tag opens beside the bar, centered on the chart's lines, and glides along as you move; the share bars ease to their new width
- Bars rise from the left in a wave on first view; heights and the axis ease when values change
- The live bar carries a slow sheen and the badge's spinner turns; reduced motion turns all of it off

### Responsive

- Fills its container; bars stay 11px wide and thin out on narrow cards, the period moves under the title
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: trend-chart, stat-card, usage-meter
