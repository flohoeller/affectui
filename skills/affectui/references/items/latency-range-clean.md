# Latency Range, clean style (Pro)

How fast an agent answers, hour by hour, like a blood-pressure chart – every hour as a bar from p50 to p95, pink above the target, the latest large and in blue

- Page: https://www.affectui.com/components/latency-range
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/latency-range-clean.json` (needs the Pro access key)
- Import: `@/components/ui/latency-range-clean`

### When to use

- How fast an agent answers over the day – the typical time and the slow tail – and whether it stays under a target
- A dashboard tile next to other agent tiles, live as new hours come in

### When not to use

- Where the time of one run goes, step by step – use Trace Waterfall
- How long each agent takes for its part – use Agent Timing

### Usage

```tsx
import { LatencyRange, type LatencyPoint } from "@/components/ui/latency-range-clean";

const points: LatencyPoint[] = hours.map((h) => ({
  label: h.hour, // "14"
  p50: h.p50Ms,
  p95: h.p95Ms,
  runs: h.runs,
}));

<LatencyRange title="Support agent latency" points={points} target={2500} onAction={() => openMetrics()} />
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| points | `LatencyPoint[]` |  | { label, p50, p95, runs? } – oldest first, the last one is now; labels must be unique, they keep the bars in place as new hours come in |
| target | `number` |  | The p95 to stay under, in ms – a pink line; the part of a bar above it runs from pink to orange |
| title | `string` | `"Latency Range"` | Heading on the frame |
| icon | `ReactNode` |  | A small mark before the title – defaults to a pulse, in pink |
| actionLabel / onAction | `string / () => void` | `"Open"` | The button on the top right – it shows when onAction is given |
| formatMs | `(ms: number) => string` | `"840ms" / "2.4s"` | Formats every time |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves into the chart (one stop) and on to Open
- ArrowLeft / ArrowRight: Walks the hours and shows each one's numbers; Home and End jump to the oldest and now
- Esc: Lets go of the hour

### Accessibility

- The chart is a single tab stop; the hour you're on is its description, with p50, p95 and runs
- Above the target is said in words, not only in pink

### Motion

- Bars grow in from the middle; a new hour comes in on the right and the others glide to their new place
- When the scale changes, the bars and the target line glide to their new heights
- Picking an hour fades the others back
- With prefers-reduced-motion everything changes at once

### Responsive

- Built on a container query; under 400px the two columns get tighter – the card keeps the same size as every agent chart card
- The oldest hours fade out at the left edge
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The scale follows the usual hours, not one outlier: room above the 90th percentile and the target; a bar that runs past it is cut at the top with a small break, its real value shows when you point at it
- Labels thin out by themselves – fewer with many hours or long labels, counted back from now; plain hours like "14" read as 14:00 in the card
- p50 and p95 are ms; a p95 below its p50 is turned the right way round, broken values are left out
- Keep about 12–24 points – it's a day at a glance, not a history
- Colors are variables on .ui-ltrc – --ui-ltrc-pink and --ui-ltrc-orange above the target, --ui-ltrc-blue for now, --ui-ltrc-bar (cyan) for the rest

### Requirements

- React 19

Related: run-transit, agent-timing, trace-waterfall, kpi-chart
