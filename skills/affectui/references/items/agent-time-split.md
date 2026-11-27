# Agent Time Split (Pro)

Where an agent's time went – working, tool calls, waiting on you and idle – as a strip of thin ticks under the total, with every part's time and share below

- Page: https://www.affectui.com/components/agent-time-split
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-time-split.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-time-split-clean.json` (needs the Pro access key) – lands as `agent-time-split-clean.tsx`, import from `@/components/ui/agent-time-split-clean` – its docs: `agent-time-split-clean.md`
- Import: `@/components/ui/agent-time-split`

### When to use

- Where an agent's time went over a day or a week – working, waiting on you, idle – and how much it waited on people
- A dashboard tile next to other agent chart cards

### When not to use

- How long each agent of a run took for its part – use Agent Timing
- Where the time of one run goes, step by step – use Trace Waterfall

### Usage

```tsx
import { AgentTimeSplit } from "@/components/ui/agent-time-split";

<AgentTimeSplit
  title="Support agent this week"
  live
  slices={[
    { id: "work", label: "Working", ms: stats.workingMs },
    { id: "wait", label: "Waiting on you", ms: stats.waitingMs },
    { id: "idle", label: "Idle", ms: stats.idleMs },
  ]}
  onAction={() => openAgent()}
/>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| slices | `TimeSlice[]` |  | { id, label, ms, color? } – in the order they read; colors default to blue, purple, pink, amber, then gray |
| live | `boolean` |  | The agent is at work right now – the last tick of the first part shimmers |
| ticks | `number` | `60` | How many ticks the strip has (12–160); every part with time gets one at least |
| title | `string` | `"Agent Time Split"` | Heading on the frame |
| icon | `ReactNode` |  | A small mark before the title – defaults to a stopwatch, in purple |
| actionLabel / onAction | `string / () => void` | `"Open"` | The button on the top right – it shows when onAction is given |
| formatDuration | `(ms: number) => string` | `"38h 48m"` | Formats every time |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the parts – each one keeps its ticks while the rest steps back – and on to Open

### Accessibility

- Every part is a stop that reads its name, time and share; the strip itself is decoration
- Shares always add up to the strip, so no part is lost to rounding

### Motion

- The ticks grow in from left to right as a wave
- While the agent is at work, the last working tick shimmers
- Pointing at a part fades every other tick, legend item and part
- With prefers-reduced-motion everything appears at once

### Responsive

- Built on a container query; under 420px the legend steps aside and every part says its name – the card keeps the same size as every agent chart card
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- More than four slices: the three largest stay, the rest join in one gray "Other (n)"
- A tiny share reads "<1%", not 0%; past 100 hours the time reads in days ("4d 12h")
- When the names get long the legend steps aside and every part carries its own name
- ms per part; broken or negative values count as nothing
- Put the agent at work first – live makes its last tick shimmer
- Colors are variables on .ui-ats – --ui-ats-c0 … --ui-ats-c4 for the parts

### Requirements

- React 19

Related: tool-activity, latency-range, run-transit, agent-timing
