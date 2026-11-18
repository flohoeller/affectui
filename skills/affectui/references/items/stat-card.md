# Stat Card (Pro)

One number with its label, how it changed – green or red, lower can be better – and room for a chart below or beside it; numbers roll, the card can be a link

- Page: https://www.affectui.com/components/stat-card
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/stat-card.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/stat-card-clean.json` (needs the Pro access key) – lands as `stat-card-clean.tsx`, import from `@/components/ui/stat-card-clean` – its docs: `stat-card-clean.md`
- Import: `@/components/ui/stat-card`

### When to use

- The KPI row on top of a dashboard – spend, tokens, latency, error rate
- One number with how it changed against the period before, and a small chart under or beside it
- Cards that open a detail view – pass href or onClick and the whole card becomes the target

### When not to use

- A chart that needs axes and a full tooltip – put a Trend Chart in a card of its own
- Many numbers in one table – a Data Table reads better than a wall of cards

### Usage

```tsx
import { StatCard } from "@/components/ui/stat-card";
import { TrendChart } from "@/components/ui/trend-chart";

export function Spend() {
  return (
    <StatCard
      label="Spend"
      value={2741}
      format={(n) => `$${(n / 1000).toFixed(1)}k`}
      change={16.5}
      changeLabel="vs last week"
      chart={
        <TrendChart
          variant="sparkline"
          labels={["Mar 3", "Mar 4", "Mar 5", "Mar 6"]}
          series={[{ label: "Spend", values: [412, 455, 398, 470] }]}
        />
      }
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` |  | What the number is |
| value | `number \| string` |  | A number rolls when it changes and is shown through format; a string is shown as it is |
| format | `(n: number) => string` | `1,284 / 2.5B` | Formats a number value |
| change | `number` |  | Change in percent against the period before – colored text with an arrow |
| changeFormat | `(n: number) => string` | `"12.4%"` | Formats the change; gets the absolute value |
| changeLabel | `string` |  | Quiet text after the change, e.g. "vs last week" |
| lowerIsBetter | `boolean` | `false` | A rise is bad news – red – and a fall good news – green |
| icon | `ReactNode` |  | A 16px icon before the label |
| chart | `ReactNode` |  | Any chart – a Trend Chart sparkline fits it exactly |
| layout | `"stacked" \| "inline"` | `"stacked"` | The chart below the number or to its right |
| footer | `ReactNode` |  | The card's last row |
| loading | `boolean` | `false` | Placeholders instead of number, change and chart – the card keeps its size |
| href | `string` |  | Makes the whole card a link |
| onClick | `() => void` |  | Makes the whole card a button |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Focus the card when it is a link or a button, then the chart inside it
- Enter: Open the card's link or press its button

### Accessibility

- Screen readers hear the final value and the change in words ("up 16.5% vs last week"), never a number on its way
- A link or button card names its label, value and change; the chart inside stays reachable on its own
- While loading the card is marked busy

### Motion

- A number rolls up from zero on first view and to its new value when it changes
- Placeholders carry a slow sheen while loading; reduced motion turns both off

### Responsive

- Fills its grid cell; the value wraps rather than being cut, the label and comparison end in an ellipsis
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: trend-chart, kpi-chart, usage-meter
