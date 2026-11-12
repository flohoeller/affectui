# Date Range Picker, clean style (Pro)

Presets and two calendars with a hover preview, comparison with the previous period or year, full keyboard control

- Page: https://www.affectui.com/components/date-range-picker
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/date-range-picker-clean.json` (needs the Pro access key)
- Import: `@/components/ui/date-range-picker-clean`

### When to use

- Analytics, reports and dashboards where people switch between periods and compare them
- Filters for bookings, invoices or logs that need a start and an end date

### When not to use

- A single date, like a birthday – a plain date field is quicker
- Ranges that span many years – type the dates instead

### Usage

```tsx
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker-clean";

export function ReportFilter() {
  return (
    <DateRangePicker
      onChange={(range, compare) => {
        loadReport(range.start, range.end);
        if (compare) loadComparison(compare.start, compare.end);
      }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `{ start: Date; end: Date }` |  | Controlled range |
| defaultValue | `{ start: Date; end: Date }` | `last 30 days` | Starting range when uncontrolled |
| onChange | `(range, compare, mode) => void` |  | Called on Apply with the range, the comparison range (or null) and the compare mode |
| presets | `{ id, label, range: (today) => DateRange }[]` | `Today … Year to date` | The list on the left (chips on phones) |
| compare | `boolean` | `true` | Show "Compare: Off / Previous period / Previous year" |
| defaultCompare | `"off" \| "previous" \| "year"` | `"previous"` | Comparison selected at the start |
| weekStartsOn | `0 \| 1` | `1` | 0 = Sunday, 1 = Monday |
| min / max | `Date` | `max: today` | Days outside can't be picked |
| defaultOpen | `boolean` | `false` | Open the panel right away |
| today | `Date` | `now` | Reference day for the presets – handy for tests and screenshots |
| className | `string` |  | Extra class on the root |

### Keyboard

- ← / → / ↑ / ↓: Move day by day and week by week
- PageUp / PageDown: Previous / next month
- Home / End: Start / end of the week
- ↵: Pick the start, then the end
- Esc: Close without applying

### Accessibility

- The trigger opens a dialog; each month is a grid and every day button has its full date as name
- Today is marked with aria-current (and a small blue dot), picked days with aria-selected; the month name is announced when it changes
- Focus moves with the arrow keys and returns to the trigger when the panel closes

### Motion

- The panel opens with a short scale and fade; months slide in from the side you're moving to and the calendars glide to their new height while the Cancel / Apply row stays in place
- After the first click the band follows the pointer as a lighter preview until the second click
- The picked ends are dark chips with a light gray band between them; the comparison period appears as a soft blue band with hairline ends
- With prefers-reduced-motion everything switches instantly

### Responsive

- Below 600px the presets turn into a scrolling row of tab chips and only the month the range ends in is shown; the footer stacks
- The panel is as wide as the screen allows (up to 652px); set --ui-drpc-panel-width, e.g. to 100%, to match your layout
- Bigger day cells and buttons on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: kpi-chart, filter-menu, breakdown-chart
