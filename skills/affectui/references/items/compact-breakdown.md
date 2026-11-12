# Compact Breakdown (Pro)

A total split into its parts in one small card – numbers roll, the bar glides and the ranked rows trade places when the period changes

- Page: https://www.affectui.com/components/compact-breakdown
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/compact-breakdown.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/compact-breakdown-clean.json` (needs the Pro access key) – lands as `compact-breakdown-clean.tsx`, import from `@/components/ui/compact-breakdown-clean` – its docs: `compact-breakdown-clean.md`
- Import: `@/components/ui/compact-breakdown`

### When to use

- One number and what it is made of – revenue by channel, usage by feature, tokens by model, tickets by category
- Dashboards where the card sits next to others and a full chart would be too much
- Whenever people switch between periods and should see what moved

### When not to use

- Trends over time – a line chart shows those; this card compares the parts of one total
- More than about seven parts – group the small ones into "Other" first
- Several measures and slicing options – use Breakdown Chart

### Usage

```tsx
import { CompactBreakdown } from "@/components/ui/compact-breakdown";

export function RevenueByChannel() {
  const [period, setPeriod] = useState("30d");
  const { items, delta } = useRevenue(period); // [{ label: "Direct", value: 16900 }, …]
  return (
    <CompactBreakdown
      title="Revenue by channel"
      periods={[
        { id: "7d", label: "7d" },
        { id: "30d", label: "30d" },
        { id: "90d", label: "90d" },
      ]}
      period={period}
      onPeriodChange={setPeriod}
      items={items}
      delta={delta}
      format={(n) => `$${Math.round(n).toLocaleString("en-US")}`}
      totalLabel="Total revenue"
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `BreakdownItem[]` |  | { id?, label, value, color? } – the parts of the shown period; the list ranks them by value. Give an id when labels can change |
| title | `string` | `"Breakdown"` | Heading of the card |
| periods | `{ id: string; label: string }[]` |  | Options of the period switch – no switch when left out |
| period | `string` |  | Controlled period id |
| defaultPeriod | `string` | `first period` | Starting period when uncontrolled |
| onPeriodChange | `(id: string) => void` |  | Called with the new period – pass the matching items and delta back in |
| delta | `number` |  | Change against the previous period in percent (12.4 or -3) – a small green or red pill next to the total |
| format | `(value: number) => string` | `whole numbers with separators` | Formats every value – the total, the rows and the hovered part |
| totalLabel | `string` | `"Total"` | Line under the big number while nothing is hovered |
| footer | `ReactNode \| null` | `"Largest: <part>"` | Replaces the line on the gray tray; null hides it |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves to the period switch, then through the rows – a focused row is highlighted like a hovered one
- ← / →: In the period switch: previous or next period (wraps around)
- Home / End: In the period switch: first or last period

### Accessibility

- A group named by its title; the period switch is a radiogroup with one tab stop
- The rolling numbers are aria-hidden – screen readers get the final total and the change in one sentence, and every row with its value and share
- Rows can be focused, so the highlight and the part's value are reachable without a mouse
- The bar is decorative: everything it shows is in the list

### Motion

- On a new period every number rolls to its value in one shared tween, so the total, the rows and the bar move in step
- The bar keeps each part's place and color and only glides to the new widths
- Rows slide to their new rank when the order changes; a part that is not in the new period folds away
- Hovering a part dims the others, lifts its segment and rolls the big number to that part's value – leaving rolls it back to the total
- The pill of the period switch slides to the chosen option; the change pill pops in
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container up to 360px; below 250px the share column goes and the values stay
- Touch screens: taller rows and period options
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep the same id (or label) for a part across periods – that is what lets rows and bar segments animate instead of being replaced
- Pass raw numbers and do the formatting in format, so the rolling values stay smooth

### Requirements

- React 19

Related: usage-meter, breakdown-chart, kpi-chart
