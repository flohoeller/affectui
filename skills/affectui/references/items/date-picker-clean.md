# Date Picker, clean style (Free)

Pick one day in the Text Field's look – a month in a small card, today marked, days outside min and max or ruled out stay visible, full keyboard control and the locale's own week

- Page: https://www.affectui.com/components/date-picker
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/date-picker-clean.json`
- Import: `@/components/ui/date-picker-clean`

### When to use

- One day in a form: the first run of a schedule, a due date, a launch day, when an export expires
- Settings rows next to Text Fields and Selects – same height, edge, label, hint and error, so the form reads as one

### When not to use

- A period with a start and an end, or comparing two periods – use the Date Range Picker
- A time of day – use the Time Picker (put both side by side for a date and a time)
- A birthday or a date far away that people know by heart – a plain Text Field is quicker to type

### Usage

```tsx
import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker-clean";

const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export function FirstRun() {
  const [day, setDay] = useState<Date | null>(null);
  return (
    <DatePicker
      label="First run"
      value={day}
      onChange={setDay}
      min={new Date()}
      isDateDisabled={weekend}
      hint="Research Agent only runs on weekdays."
      name="firstRun"
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `Date \| null` |  | The chosen day – makes it controlled; null shows the placeholder |
| defaultValue | `Date \| null` | `null` | Starting day when uncontrolled |
| onChange | `(date: Date) => void` |  | Called with the picked day, at local midnight |
| min | `Date` |  | Days before it can't be picked; the month arrow stops there |
| max | `Date` |  | Days after it can't be picked; ignored when it lies before min |
| isDateDisabled | `(date: Date) => boolean` |  | Rules out single days, e.g. weekends or holidays – they stay visible but can't be picked |
| locale | `string` |  | BCP 47 locale for month names, weekdays, digits and the shown value – the browser's by default |
| weekStartsOn | `0 – 6` |  | 0 = Sunday … 6 = Saturday – by default the locale's first day of the week |
| placeholder | `string` | `"Pick a date"` | Shown in gray while nothing is chosen |
| label | `ReactNode` |  | Shown above the field and read out with the value |
| hint | `ReactNode` |  | A quiet line under the field – the error takes its place while there is one |
| error | `ReactNode` |  | Marks the field invalid (red edge, aria-invalid) and shows the message where the hint was |
| optional | `boolean` | `false` | Adds "Optional" next to the label |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 28 · 32 · 36px high, like the Text Field; taller on touch screens |
| disabled | `boolean` | `false` | Dims the field and ignores input |
| name | `string` |  | Sends the day as YYYY-MM-DD with a form, through a hidden input |
| required | `boolean` |  | Sets aria-required – check it on submit like any other field |
| today | `Date` |  | Where the today marker sits – the real today by default |
| defaultOpen | `boolean` | `false` | Opens the calendar on mount without taking the focus – for previews |
| aria-label | `string` |  | Accessible name when there is no visible label |
| className | `string` |  | Extra class on the wrapper, e.g. a fixed width in a settings row |
| ref | `Ref<HTMLButtonElement>` |  | The field's button – focus it after a validation error |

### Keyboard

- Enter / Space / ↓: On the field: open the calendar, with the focus on the chosen day (or today)
- ← / →: Previous or next day (mirrored in right-to-left layouts)
- ↑ / ↓: Same weekday a week earlier or later
- PageUp / PageDown: Same day a month earlier or later; with Shift a year
- Home / End: First or last day of the week
- Enter / Space: Pick the focused day and close
- Esc: Close without changing anything; the focus goes back to the field
- Tab: Between the month arrows and the days; tabbing out closes the calendar

### Accessibility

- The date picker dialog pattern: the field is a button with aria-haspopup="dialog"; the calendar is a non-modal dialog named by its month, the days a grid with one tab stop that moves with the arrow keys
- Every day is read out in full ("Thursday, November 12, 2026"); today carries aria-current="date", the chosen day aria-selected
- Days that can't be picked keep the focus (aria-disabled) so the arrow keys can walk past them, but Enter and clicks do nothing
- The month name is a polite live region, so paging through months is announced; weekday heads carry their full names
- The label names the field together with its value; hint and error are linked with aria-describedby, an error sets aria-invalid
- The ring shows only under keyboard focus (:focus-visible), never after a click – inside the day it sits on

### Motion

- The calendar fades in out of a small lift from the field's edge – downward, or upward when it opens above
- Months slide in from the side you went to; the chosen day pops in as a dark chip
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container; the calendar stays inside the window and opens above the field near the bottom of the screen
- Always six weeks high, so the card never changes height between months
- It lives in the top layer (popover), so a card's overflow or z-index never cuts it
- Touch screens get 40px days and 16px text; dark mode built in via .dark or data-theme="dark" on an ancestor

### Requirements

- React 19

Related: date-range-picker, time-picker, text-field, select
