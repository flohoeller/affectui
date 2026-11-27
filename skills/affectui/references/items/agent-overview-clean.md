# Agent Overview, clean style (Pro)

One agent's dashboard from the six agent chart cards – what it did, what it costs, how fast it is, what it's doing now and when it runs next

- Page: https://www.affectui.com/blocks/agent-overview
- Section: Blocks · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-overview-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-overview-clean`

### When to use

- One agent's page in a dashboard: what it did, what it costs, how fast it is, what it's doing now and when it runs next
- An overview where every card links on to its own detail view through its Open button

### When not to use

- Many agents side by side – use Mission Control or Agent Monitor
- One run step by step – use Run Inspector

### Usage

```tsx
import { AgentOverview } from "@/components/blocks/agent-overview-clean";

<AgentOverview
  title="Research agent"
  subtitle="This week"
  activity={{ title: "Tool calls", tools, days }}
  timeSplit={{ title: "Time this week", slices }}
  budget={{ title: "Tokens per run", runs, limit: 250_000, models }}
  latency={{ title: "Response time", points, target: 2500 }}
  transit={{ title: "Customer migration", from, to, progress, eta }}
  window={{ title: "Next run", range, start, end, now, onChange }}
/>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | Heading above the cards, e.g. the agent's name – no heading when left out |
| subtitle | `string` |  | A quiet line under the heading, e.g. "This week" |
| activity | `ToolActivityProps` |  | Tool Activity – the tools it used, day by day |
| timeSplit | `AgentTimeSplitProps` |  | Agent Time Split – where its time went |
| budget | `TokenBudgetProps` |  | Token Budget – tokens per run against a limit |
| latency | `LatencyRangeProps` |  | Latency Range – how fast it answers, hour by hour |
| transit | `RunTransitProps` |  | Run Transit – the job it carries right now |
| window | `RunWindowProps` |  | Run Window – when it may run |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the cards in reading order – every chart is one stop, then its Open button
- ArrowLeft / ArrowRight: On a chart: steps through its days, hours or runs; on the run window: moves it
- Esc: Lets go of the point

### Accessibility

- A section labeled with the title ("Agent overview" without one); every card keeps its own labels, descriptions and keyboard as on its own page

### Motion

- Every card plays as it does on its own; the block adds no motion of its own
- With prefers-reduced-motion every card changes at once

### Responsive

- Two cards side by side; under 720px of container width one column – it follows its container, not the window
- Every card has the same height, so the rows line up
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Each prop is the full props object of that card – see each card's docs for its data; a card left out takes no room
- The order is fixed: activity and time split, tokens and latency, transit and window – what it did, what it costs, what's next

### Requirements

- React 19
- Tool Activity, Agent Time Split, Token Budget, Latency Range, Run Transit and Run Window (clean)

Related: tool-activity, agent-time-split, token-budget, latency-range, run-transit, run-window
