# Usage Meter (Pro)

Plan usage and AI credits – a stacked credits meter by category, daily sparkline, limits and a button that speaks up near the limit

- Page: https://www.affectui.com/components/usage-meter
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/usage-meter.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/usage-meter-clean.json` (needs the Pro access key) – lands as `usage-meter-clean.tsx`, import from `@/components/ui/usage-meter-clean` – its docs: `usage-meter-clean.md`
- Import: `@/components/ui/usage-meter`

### When to use

- The usage or billing page of a SaaS or AI product – credits, tokens, minutes or messages per billing cycle
- Showing what the usage went into (chat, search, images, API) next to plan limits like seats and storage
- Nudging people to top up or upgrade right where they see they're running out

### When not to use

- Long-term trends over many months – a line chart like the KPI Chart reads better
- More than about five categories – the bar gets too thin; group the small ones into "Other"

### Usage

```tsx
import { useState } from "react";
import { UsageMeter } from "@/components/ui/usage-meter";

export function Usage({ usage }) {
  const [period, setPeriod] = useState("month");
  const data = usage[period]; // { used, limits, daily } per period from your API

  return (
    <UsageMeter
      title="Acme AI"
      plan="Pro plan"
      total={10000}
      used={data.used} // [{ label: "Chat", value: 3980 }, { label: "Search", value: 1640 }, …]
      limits={[
        { label: "Seats", used: 8, total: 10 },
        { label: "Storage", used: 3.2, total: 5, unit: "GB" },
        { label: "Projects", used: 12, total: null }, // unlimited
      ]}
      daily={data.daily} // [{ label: "Oct 1", value: 312 }, …, { label: "Oct 17", value: null }]
      periods={[
        { id: "month", label: "This month" },
        { id: "last", label: "Last month" },
        { id: "7d", label: "7 days" },
      ]}
      period={period}
      onPeriodChange={setPeriod}
      resetAt="2026-10-17"
      onUpgrade={(state) => (state === "ok" ? openPlans() : openTopUp())}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| total | `number` |  | Credits included in the plan – the bar's full width |
| used | `{ label: string; value: number; color?: string }[]` |  | What the credits went into in the shown period. Without colors the parts get shades of the accent, then grays; each label keeps its shade |
| limits | `{ label; used; total?: number \| null; unit?; decimals? }[]` |  | Thin meters below, e.g. seats and storage. Leave total out (or null) for unlimited – shown as "of ∞" on a striped track |
| periods | `{ id: string; label: string }[]` |  | Options of the period switch; no switch when left out |
| period | `string` |  | Controlled period id – pass the matching used, limits and daily with it |
| defaultPeriod | `string` |  | Starting period when uncontrolled; defaults to the first option |
| onPeriodChange | `(id: string) => void` |  | Called when a period is picked |
| resetAt | `Date \| string \| number` |  | When the credits reset – shown as "Resets in 9 days", the date on hover |
| daily | `{ label: string; value: number \| null }[]` |  | Usage per day for the sparkline; null for days still to come, shown as flat stubs |
| onUpgrade | `(state: "ok" \| "warn" \| "limit") => void` |  | Called by the button with the current state |
| title | `string` | `"Usage"` | Card title, e.g. the workspace or product name |
| plan | `string` |  | Plan name in front of the reset date |
| unit | `string` | `"credits"` | Unit of the main meter |
| warnAt | `number` | `0.8` | Share (0–1) from which the meter and the limits warn |
| upgradeLabel | `string` | `"Upgrade"` | Button text while there is room left (a quiet button) |
| topUpLabel | `string` | `"Add credits"` | Button text near and at the limit (a solid button) |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Reaches the period switch, the bar, the sparkline and the button
- ← / →: Switch: picks the previous or next period. Bar: steps through the categories. Sparkline: steps through the days
- Esc: Hides the category or day readout

### Accessibility

- A section labelled by its title; the bar and every limit are meters with their value as text ("7,420 of 10,000 credits")
- The period switch is a radio group with a roving tab stop
- The category tooltip is a polite live region, so stepping through the bar reads each part
- Running low and reaching the limit are announced in a polite live region; amber is never the only signal – the text says it too

### Motion

- On first view the bar fills from zero and every number counts up, in one frame loop so numbers and widths stay in step
- Switching periods: the white pill glides to the new option, numbers roll to their new values and the parts glide to their new widths
- A category that drops out shrinks to nothing on the bar while its legend row folds away; the card glides to its new height
- Hovering a part dims the others and highlights its legend row; the tooltip glides along the bar
- Near the limit a small amber dot pops in and the button turns solid with a gentle nudge, its width gliding to the new label
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container up to 460px; at 400px and below the switch gets its own row and the limits stack as rows
- Works down to 320px wide; long labels end with an ellipsis, numbers and units never split
- Touch: tapping a part or a legend row shows its value, targets grow to 36–38px
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: kpi-chart, breakdown-chart, billing-schedule, progress-tracker
