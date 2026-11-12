# Billing Schedule, clean style (Pro)

Build a billing phase – start date, duration, products with repeats and timing, discount, minimum and live totals

- Page: https://www.affectui.com/components/billing-schedule
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/billing-schedule-clean.json` (needs the Pro access key)
- Import: `@/components/ui/billing-schedule-clean`

### When to use

- Quoting and contract tools where a phase of billing is put together – set-up fees, licences, support
- Admin screens for subscriptions with one-off and recurring charges, discounts and minimum commitments

### When not to use

- A simple plan picker – use the Pricing Plans block
- Usage-based pricing with tiers per unit – this works with fixed prices per line

### Usage

```tsx
import { BillingSchedule } from "@/components/ui/billing-schedule-clean";

export function NewContract() {
  return (
    <BillingSchedule
      phase="Build-out phase"
      defaultStart="2026-01-01"
      onChange={(schedule) => save(schedule)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | `"Create a billing schedule"` | Heading at the top of the card |
| phase | `string` | `"Build-out phase"` | Starting phase name – editable in the summary |
| currency | `string` | `"$"` | Currency symbol for prices and totals |
| catalog | `CatalogItem[]` |  | Products under Add product – { name, repeat, price } |
| defaultLines | `ScheduleLine[]` |  | Lines to start with – products, a discount or a minimum |
| defaultStart | `string` | `"2026-01-01"` | Start date as yyyy-mm-dd |
| onChange | `(schedule) => void` |  | Called with { phase, start, duration, lines } after every change |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the phase name, the fields, every line and the buttons
- Enter: Confirms a price, opens a menu or the calendar, picks the focused option or day
- ↑ / ↓: In a menu: the option before or after – Home and End jump to the ends
- ← / → / ↑ / ↓: In the calendar: a day back or on, a week up or down – Home and End the week's ends
- Page Up / Page Down: In the calendar: a month back or on – with Shift a year
- Esc: Closes the open menu or calendar and returns to its button

### Accessibility

- The lines are a table with column headers; every input and menu button has a label naming its line and its current value
- Duration, Repeats, Billed and Add product are buttons that open listboxes; the start date opens a calendar grid with every day named in full – the same in every browser and language; totals are announced politely

### Motion

- New lines slide in and the table glides to its new height; the duration menu and catalog scale in
- The end date in the summary fades when it changes
- With prefers-reduced-motion changes happen instantly

### Responsive

- Fills its container up to 560px; on narrow screens the fields stack and the Repeats column hides
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
