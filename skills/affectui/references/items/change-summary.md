# Change Summary (Free)

What moved since last time – one metric per row with a colored trend

- Page: https://www.affectui.com/components/change-summary
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/change-summary.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/change-summary-clean.json` – lands as `change-summary-clean.tsx`, import from `@/components/ui/change-summary-clean` – its docs: `change-summary-clean.md`
- Import: `@/components/ui/change-summary`

### When to use

- A short recap at the top of a dashboard or a weekly report
- Explaining in words what changed, next to the charts that show it

### When not to use

- Exact values people compare over time – use the KPI Chart or a table
- More than about six metrics – the recap stops being a quick read

### Usage

```tsx
import { ChangeSummary } from "@/components/ui/change-summary";

const changes = [
  { label: "Active users", change: "Up 6.1% to 18.2K", tone: "good" },
  { label: "Churn", change: "Down to 2.1% from 2.6%", tone: "good", direction: "down" },
  { label: "Support tickets", change: "Up 14% to 312", tone: "bad", direction: "up" },
];

export function Recap() {
  return <ChangeSummary period="This week" changes={changes} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| changes | `MetricChange[]` |  | label, change text, tone (good, bad, neutral) and the arrow direction |
| title | `string` | `"What's changed"` | Heading in the gray tray |
| period | `string` |  | Small text on the right of the heading |
| icon | `ReactNode` |  | Replaces the icon in front of the heading |
| className | `string` |  | Extra class on the tray |

### Accessibility

- A description list, so each change is read together with its metric
- The trend arrow is decorative – the text says what happened

### Motion

- Rows fade in one after another; reduced motion shows them at once

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: kpi-chart, decision-inbox
