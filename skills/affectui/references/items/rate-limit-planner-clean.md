# Rate Limit Planner, clean style (Pro)

Plan when your agents run so they stay under the API's rate limit – the day's load as a line chart, one row per agent run to drag; Spread out lowers the peak, the overflow is hatched in red

- Page: https://www.affectui.com/components/rate-limit-planner
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/rate-limit-planner-clean.json` (needs the Pro access key)
- Import: `@/components/ui/rate-limit-planner-clean`

### When to use

- Scheduling agent runs, cron jobs or batch work against one API rate limit (tokens per minute)
- Showing why a run hit 429s – which runs overlap and when the day goes over
- An ops or settings page where people move their own jobs and see the peak change as they drag

### When not to use

- Live monitoring of every request – use a metrics chart; this plans a day
- Many separate limits at once (per model, per key) – one planner per limit
- More than about ten runs a day – the rows get long; group runs per agent first

### Usage

```tsx
import { useState } from "react";
import { RateLimitPlanner, type PlannedRun } from "@/components/ui/rate-limit-planner-clean";

const runs: PlannedRun[] = [
  { id: "triage", name: "Inbox triage", at: 8 * 60, peak: 46_000, rise: 45, halfLife: 70 },
  { id: "research", name: "Lead research", at: 11 * 60, peak: 82_000, rise: 60, halfLife: 90 },
  { id: "report", name: "Report writer", at: 15 * 60 + 30, peak: 74_000, rise: 55, halfLife: 100 },
];

export function Schedule() {
  const [plan, setPlan] = useState(runs);
  return (
    <RateLimitPlanner
      runs={plan}
      onRunsChange={setPlan}
      limit={120_000}
      checkpoint={{ at: 23 * 60, label: "Nightly batch" }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| runs | `PlannedRun[]` |  | The runs, controlled – each with id, name, start (minutes after midnight) and peak tokens per minute; pair with onRunsChange |
| defaultRuns | `PlannedRun[]` |  | Starting runs when uncontrolled |
| onRunsChange | `(runs: PlannedRun[]) => void` |  | Called on every drag, Spread out, edit, add and remove |
| limit | `number` |  | The API's limit in tokens per minute |
| buffer | `number` | `0.8` | Share of the limit to stay under – above it the badge says Close to limit |
| startHour | `number` | `6` | Hour the 24-hour window starts at |
| checkpoint | `{ at: number; label: string }` |  | A fixed time to check against, e.g. a nightly batch – what's still running then is read out |
| now | `number` |  | The time now, in minutes after midnight – runs that already started stay put, Spread out and Add run only use the time after it |
| actual | `number[]` |  | Measured tokens per minute from the window's start up to now – drawn solid, the plan ahead dashed, and compared in the footer |
| today | `"weekdays" \| "weekend"` | `"weekdays"` | Runs with days set to the other kind are left out |
| selected | `string` |  | Id of the run shown in its color in the chart – controlled; pair with onSelectedChange |
| onSelectedChange | `(id: string) => void` |  | Called when a row or bar is picked |
| title | `string` | `"Rate limit"` | Heading of the card |
| className | `string` |  | Extra class on the card |
| PlannedRun.rise | `number` | `30` | Minutes until a run reaches its peak |
| PlannedRun.halfLife | `number` | `45` | Minutes until its load has halved again – the tail |
| PlannedRun.days | `"daily" \| "weekdays" \| "weekend"` | `"daily"` | Which days it runs on |
| PlannedRun.color | `string` |  | Any CSS color – by default each run takes the next color of the design system's palette |

### Keyboard

- Tab: Moves through Spread out, each run's bar, its remove and edit buttons, Add run and the footer's Move to
- ← / →: On a bar: moves the run 15 minutes earlier or later
- Shift / ← / →: On a bar: moves it an hour (Page Up / Page Down too)
- Home / End: On a bar: the earliest start (now) or the latest that still fits the day
- Enter: On a bar or ⋯: opens the run's settings
- Delete: On a bar: removes the run – focus moves on to the next one
- Esc: Closes the settings and returns to ⋯; tabbing out closes them too

### Accessibility

- Every bar is a slider with the run's name, start and peak as its value text; runs that already started are marked as disabled
- The footer sentence is a polite live region and describes each bar – screen readers hear what a move did
- The settings window is a dialog; focus lands in the name field and returns to ⋯ when it closes
- The chart is decoration – everything in it is also in the badge, the rows and the footer

### Motion

- The lines ease to their new shape after every move; the peak's dot, the hatched overflow and the tooltip move with them
- Spread out, Move to and Add run glide the bars to their place; a drag follows the pointer directly
- New rows slide open and their bar grows in, removed rows fold away; the settings window pops in
- Reduced motion jumps to the end state and stops the running sheen

### Responsive

- Fills its container; below 560px the chart and bars take the full width and each run's name moves onto its own line above its bar
- On touch screens the picked row shows its remove and settings buttons – there's no hover to reveal them
- Broken numbers from an API (NaN, negative, a start outside the day) fall back to safe values instead of breaking the chart
- Touch works: drag a bar with a finger; the page still scrolls when you swipe elsewhere
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"
- Every color, the font, radius and shadows come from the design system tokens (--aui-*), so it follows your theme

### Notes for AI

- A run's load is modelled, not measured: an S-shaped climb over `rise` minutes, then a tail that halves every `halfLife` minutes – estimate both from a few real runs
- Feed `actual` from your provider's usage endpoint or your own logs, one value per minute since `startHour`
- Write the new start times back from onRunsChange to your scheduler (cron, queue, workflow tool)

### Requirements

- React 19

Related: agent-lanes, scheduled-runs, cost-waterfall, usage-meter
