# KPI Board, clean style (Pro)

The top of a dashboard – three trend cards, an overview chart that compares this period with the last, and a focus card; hover shows any day's value and every number rolls when the range changes

- Page: https://www.affectui.com/blocks/kpi-board
- Section: Blocks · Analytics
- Install: `npx shadcn@latest add https://www.affectui.com/r/kpi-board-clean.json` (needs the Pro access key)
- Import: `@/components/ui/kpi-board-clean`

### When to use

- The top of a dashboard: a few headline numbers with their trend, one chart that compares this period with the last, and one product or plan in focus
- Sales, growth and usage overviews of a SaaS or AI product, above a table or a list
- When the charts belong together – same range, same filter – and should react as one

### When not to use

- One metric in depth – use KPI Chart or Breakdown Chart
- Parts of a whole (shares, funnels, rankings) – the board only draws trends over time
- Reports that are printed or exported – this is built for pointing and switching

### Usage

```tsx
import { KpiBoard, type KpiBoardData } from "@/components/ui/kpi-board-clean";

const ranges = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

export function Overview({ data }: { data: Record<string, KpiBoardData> }) {
  // data["30d"] = { stats, overview, focus }
  return <KpiBoard data={data} ranges={ranges} defaultRange="30d" compareLabel="vs. last month" />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | `Record<string, KpiBoardData>` |  | One data set per range id: { stats, overview, focus } |
| ranges | `{ id: string; label: string }[]` |  | Options of the date range picker |
| range | `string` |  | Controlled range id |
| defaultRange | `string` | `first range` | Starting range when uncontrolled |
| onRangeChange | `(id: string) => void` |  | Called with the new range |
| segments | `{ id: string; label: string }[]` |  | A filter inside the overview card, e.g. All items / Pro / Team – it only switches that card's lines; no filter when left out |
| segment | `string` |  | Controlled segment id |
| defaultSegment | `string` | `first segment` | Starting segment when uncontrolled |
| onSegmentChange | `(id: string) => void` |  | Called with the new segment |
| compareLabel | `string` | `"vs. last period"` | Words after every change |
| currentLabel | `string` | `"This period"` | Name of the main line in the tooltip and the focus card |
| previousLabel | `string` | `"Last period"` | Name of the comparison line |
| formatMoney | `(value: number) => string` | `$1,234.00` | Formats money values |
| icon | `ReactNode` |  | Icon in the focus card |
| title | `string` |  | Heading on the left of the bar above the cards |
| setup | `{ label: string; onClick: () => void }` |  | The small button at the top right of the focus card, e.g. Set up |
| action | `{ label: string; onClick: () => void }` |  | The button at the bottom of the focus card |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the pickers and the action
- Enter / Space / ↓: On a picker: opens its menu
- ↑ / ↓ / Home / End: In an open menu: moves through the choices
- Enter: Picks the highlighted choice
- Esc: Closes the menu without changing anything

### Accessibility

- Every card is a labelled region with its numbers as text; the charts themselves are decorative
- The pickers are comboboxes with a listbox: the open state, the highlighted and the chosen option are announced
- Changes are small tinted badges with an arrow, so they don't rely on color alone; the color follows whether the change is good news (lowerIsBetter)

### Motion

- On first view the cards rise in one after another and every line draws itself in from the left
- Switching the range rolls every number in one shared tween while every line is drawn in again from the left
- The filter inside the overview does the same for that card only – the other cards stay still
- Hovering a small card marks the day under the pointer with a dot, its value in a tag and the date on the axis
- Hovering the overview shows a dark tooltip that compares this period with the last at that day
- With prefers-reduced-motion everything switches without movement

### Responsive

- The date range sits above the cards on the right. Three small cards over a wide overview and the focus card; below 820px of container width the two lower cards take a full row each, below 600px everything stacks
- It follows its container, not the window
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Series may have different numbers of points per range (7 days, 30 days, 13 weeks) – each range is drawn in fresh
- A stat's value is the sum of its series; `previous` is the total of the period before and drives the change on the right
- Points that are not a number count as 0 and show as — on hover; a previous total of 0 leaves the change out instead of showing +0%
- focus.unitOne is the word after a count of exactly 1 – without it the unit loses its plural s ("1 license"), so only irregular words like person need it; long labels end in an ellipsis with the full text in a tooltip, numbers are never cut
- The date range sits in the bar above the cards because it changes all of them; the picker inside the overview is the segment and only switches the overview's own lines (overview.segments)

### Requirements

- React 19

Related: metrics-dashboard, kpi-chart, usage-meter
