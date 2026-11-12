# Plan vs Actual (Pro)

An agent's plan against what really happens – every step's bar grows over its dashed planned ghost, overruns turn amber, the steps after it slide right, and the expected finish moves away from the planned one

- Page: https://www.affectui.com/components/plan-vs-actual
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/plan-vs-actual.json` (needs the Pro access key)
- Import: `@/components/ui/plan-vs-actual`

### When to use

- Showing whether an agent's run keeps to its plan – and if not, which step made it late
- Plans with steps that wait for each other, where one overrun pushes everything after it
- Giving people an honest expected finish time while the run is still going

### When not to use

- Where the time and money of each call go – use Trace Waterfall
- Reviewing or editing the plan before it runs – use Agent Plan
- Several agents working side by side – use Agent Lanes

### Usage

```tsx
import { PlanVsActual, type PlanStep } from "@/components/ui/plan-vs-actual-clean";

const steps: PlanStep[] = [
  { id: "brief", title: "Read the brief", plan: 20000, start: 0, end: 16000 },
  { id: "layout", title: "Build the layout", plan: 60000, deps: ["brief"], start: 17000 },
  { id: "stripe", title: "Wire up Stripe", plan: 45000, deps: ["layout"] },
];

export function Progress({ now }: { now: number }) {
  return <PlanVsActual steps={steps} now={now} task="Ship the pricing page" />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `PlanStep[]` |  | { id, title, plan, deps?, start?, end?, icon? } – list a step after the steps it waits for |
| plan | `number` |  | Per step – how long it was planned to take, in ms; the planned start follows from deps |
| deps | `string[]` |  | Per step – ids of the steps that have to finish first |
| start / end | `number` |  | Per step – when it really started and finished, in ms from the start of the run; leave end out while it runs, both while it waits |
| now | `number` |  | Where the run is, in ms from its start – running bars grow to it, waiting steps can't start before it |
| task | `string` |  | What the run is for – next to the heading |
| formatTime | `(ms: number) => string` | `0:42` | Formats the axis, the bars' numbers and the finish lines |
| title | `string` | `"Plan vs actual"` | Heading of the bar on top |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the steps – the focused one shows what it waits for and what waits for it

### Accessibility

- The steps are a list; each one is focusable and reads how long it took against the plan, or when it's expected to start
- Late and early are said in words as well as color – “+25s” and “25s behind”
- The chart itself is hidden from screen readers – the rows carry everything it shows

### Motion

- Running bars grow with the run, with a sheen sweeping along and a glowing leading edge; past the plan the growing part turns amber
- Waiting steps glide to their new expected place when a step before them runs over or finishes early
- The expected finish line moves, the gap to the planned one tints, and the axis glides wider when the run needs more room
- Pointing at a step draws its links to the steps it waits for and the ones waiting for it
- With prefers-reduced-motion nothing glides, sweeps or glows

### Responsive

- Rows keep their height, so nothing jumps while steps start and finish
- Under 560px the name column narrows, the task, icons and key drop out and every other axis label hides
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- start, end and now are ms from the start of the run – subtract the run's start time from your event times
- Order steps so that every step comes after the ones it waits for – the links are drawn downwards
- A step without deps is planned to start at 0
- Colors are variables on .ui-pvac, e.g. --ui-pvac-over-bg or --ui-pvac-actual-edge

### Requirements

- React 19

Related: trace-waterfall, agent-plan, agent-lanes, agent-tree
