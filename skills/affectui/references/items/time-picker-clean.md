# Time Picker, clean style (Free)

A time of day you type or pick – a list every few minutes with a gliding highlight, 12 or 24 hours by locale, min and max, and typing that understands 930, 9:30 pm or 21.30

- Page: https://www.affectui.com/components/time-picker
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/time-picker-clean.json`
- Import: `@/components/ui/time-picker-clean`

### When to use

- A time of day in a form: when an agent runs, when the daily digest is sent, quiet hours, a reminder
- Next to a Date Picker for a date and a time, or on its own in a settings row – same height, edge, label, hint and error as the Text Field

### When not to use

- A day – use the Date Picker; a period of days – use the Date Range Picker
- A duration ("for 45 minutes") or a rhythm ("every 2 hours") – a number field or a Select reads better
- Three or four fixed slots people choose between – use the Segmented Control or a Select

### Usage

```tsx
import { useState } from "react";
import { TimePicker } from "@/components/ui/time-picker-clean";

export function RunAt() {
  const [time, setTime] = useState<string | null>("09:30");
  return (
    <TimePicker
      label="Run at"
      value={time}
      onChange={setTime}
      step={15}
      hint="Every weekday, in your time zone."
      name="runAt"
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `string \| null` |  | The chosen time as "HH:mm" (24 h, like a native time input) – makes it controlled; null shows the placeholder |
| defaultValue | `string \| null` | `null` | Starting time when uncontrolled |
| onChange | `(value: string \| null) => void` |  | Called with "HH:mm" when a time is picked or typed, or null when the field is cleared |
| step | `number` | `15` | Minutes between the times in the list, counted from min – typing can still set any minute |
| min | `string` |  | The earliest time, "HH:mm" – the list starts here, earlier typed times are put back |
| max | `string` |  | The latest time, "HH:mm" – ignored when it lies before min |
| hourCycle | `12 \| 24` |  | 9:30 PM or 21:30 – by default the locale's |
| locale | `string` |  | BCP 47 locale for how times are written – the browser's by default; its own AM / PM words can be typed too |
| placeholder | `string` |  | Shown in gray while nothing is chosen – by default 9:00 in the right format, as an example |
| label | `ReactNode` |  | Shown above the field and used as the list's name |
| hint | `ReactNode` |  | A quiet line under the field – the error takes its place while there is one |
| error | `ReactNode` |  | Marks the field invalid (red edge, aria-invalid) and shows the message where the hint was |
| optional | `boolean` | `false` | Adds "Optional" next to the label |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 28 · 32 · 36px high, like the Text Field; taller on touch screens |
| disabled | `boolean` | `false` | Dims the field and ignores input |
| name | `string` |  | Sends "HH:mm" with a form, through a hidden input |
| required | `boolean` |  | Sets aria-required – check it on submit like any other field |
| aria-label | `string` |  | Accessible name when there is no visible label |
| className | `string` |  | Extra class on the wrapper, e.g. a fixed width in a settings row |
| ref | `Ref<HTMLInputElement>` |  | The text input – focus it after a validation error |

### Keyboard

- ↓ / ↑: Open the list at the chosen time (or the next one from now); inside it, move between times
- PageDown / PageUp: In the open list: an hour later or earlier
- 0–9 / A–Z: Type a time – "9", "930", "9:30 pm", "21.30"; the list jumps to it as you type
- Enter: Pick the highlighted time, or keep what was typed
- Esc: Close the list; pressed again, undo what was typed
- Tab: Keep what was typed and move on

### Accessibility

- The editable combobox pattern: a text input with role="combobox" and aria-autocomplete="list" that controls a listbox; the focus stays in the input while aria-activedescendant follows the highlight
- Typed text that isn't a time, or lies outside min / max, is put back to the last good time when the field is left – nothing half-typed is ever sent
- The label names both the field and the list; hint and error are linked with aria-describedby, an error sets aria-invalid
- No focus ring on the text field – its edge firms up instead; the list button is reached by pointer only, the keys open the list from the input

### Motion

- The list fades in out of a small lift from the field's edge – downward, or upward when it opens above – centred on the chosen time
- One soft highlight glides between the rows as the pointer, the keys or the typing move; the check on the chosen time draws itself
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container – about 120px is enough; the list is as wide as the field
- The list opens where there is room and stays inside the window; it lives in the top layer, so a card's overflow never cuts it
- Touch screens get 40px rows and 16px text (no zoom on iOS); dark mode built in via .dark or data-theme="dark" on an ancestor

### Requirements

- React 19

Related: date-picker, select, text-field, date-range-picker
