# Number Ticker (Free)

Odometer-style numbers – every digit rolls to its new value and counts in from zero when it scrolls into view

- Page: https://www.affectui.com/motion/number-ticker
- Section: Motion · Numbers
- Install: `npx shadcn@latest add https://www.affectui.com/r/number-ticker.json`
- Import: `@/components/ui/number-ticker`

### When to use

- KPIs, prices and counters that change while the user is looking, like dashboards or live stats
- Headline numbers on a landing page that should count in when they scroll into view

### When not to use

- Dense tables with many numbers – rolling digits everywhere becomes noise
- Values that change many times per second; the roll never settles

### Usage

```tsx
import { NumberTicker } from "@/components/ui/number-ticker";

export function RevenueKpi({ revenue }: { revenue: number }) {
  return (
    <p className="text-4xl font-semibold">
      <NumberTicker value={revenue} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
    </p>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `number` |  | The number to show – change it and the digits roll to the new value |
| format | `Intl.NumberFormatOptions` |  | Formatting, e.g. currency, percent, compact notation or fraction digits |
| locale | `string` | `browser locale` | Locale passed to Intl.NumberFormat, e.g. "en-US" or "de-DE" |
| duration | `number` | `900` | Length of a roll in milliseconds |
| delay | `number` | `0` | Wait before the first count-in, in milliseconds |
| className | `string` |  | Extra class on the wrapper – font size, weight and color are inherited |

### Accessibility

- The formatted value is in a visually hidden text inside an aria-live="polite" region, so screen readers hear the final number once
- The rolling digit columns are aria-hidden

### Motion

- Each digit rolls up when the value grows and down when it shrinks; new columns (9,999 → 10,000) slide in
- Counts in from 0 the first time it scrolls into view
- Reduced motion jumps straight to the value

### Responsive

- Inherits font size and weight from its parent and uses tabular numbers, so the width stays steady while rolling
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
