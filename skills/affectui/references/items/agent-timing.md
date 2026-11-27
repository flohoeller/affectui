# Agent Timing (Pro)

An agent run as a timing diagram – a signal line per agent that steps up when it thinks or calls a tool, with hand-offs drawn straight between rows

- Page: https://www.affectui.com/components/agent-timing
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-timing.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-timing-clean.json` (needs the Pro access key) – lands as `agent-timing-clean.tsx`, import from `@/components/ui/agent-timing-clean` – its docs: `agent-timing-clean.md`
- Import: `@/components/ui/agent-timing`

### When to use

- An agent run where it matters when each agent worked, how long, and where it waited
- Finding where a run loses time – long tool calls, agents sitting idle, the run waiting on you
- A live view of a multi-agent run next to its chat or log

### When not to use

- Who said what to whom, in order – use Agent Sequence
- Spans of one trace with their nesting – use Trace Waterfall
- Agents working side by side on separate tasks – use Agent Lanes

### Usage

```tsx
import { AgentTiming, type TimingParticipant, type TimingSegment, type TimingHandoff } from "@/components/ui/agent-timing";

const participants: TimingParticipant[] = [
  { id: "you", name: "You", kind: "person" },
  { id: "lead", name: "Lead" },
  { id: "coder", name: "Coder" },
];

const segments: TimingSegment[] = [
  { who: "lead", state: "thinking", start: 0.5, end: 4, label: "Planning the fix" },
  { who: "lead", state: "tool", start: 4, end: 8, label: "search_code" },
  { who: "coder", state: "tool", start: 9, label: "edit_file" }, // no end – still running
];

const handoffs: TimingHandoff[] = [
  { from: "you", to: "lead", at: 0.2, label: "Fix the cart total bug" },
  { from: "lead", to: "coder", at: 8.6, label: "Fix rounding in cart.ts" },
];

export function Run({ now }: { now: number }) {
  return <AgentTiming title="Fix the cart total" participants={participants} segments={segments} handoffs={handoffs} now={now} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| participants | `TimingParticipant[]` |  | The rows – { id, name, kind?, color? }. person is the full pixel mark in ink; agents their own mark, the first blue, the others the palette |
| segments | `TimingSegment[]` |  | What each one did – { who, state, start, end?, label?, id? } in seconds from the start. thinking is a low step, tool a high one with its name, waiting a dashed amber step. No end: it still runs and reaches to now |
| handoffs | `TimingHandoff[]` |  | Hand-offs – { from, to, at, label?, id? }. A thin arrow from one row to the other, drawn in as now passes it |
| now | `number` |  | Seconds since the run started – the now line; steps without an end grow to it. Leave it out for a finished run |
| duration | `number` |  | Seconds the axis shows – by default the run's length with a little room |
| title | `string` |  | The run's name in the bar |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-atg-gutter |

### Keyboard

- Tab: One stop for the diagram
- ← / →: The step before or after in the same row – each shows its card
- ↑ / ↓: The nearest step in the row above or below
- Home / End: The row's first or last step
- Esc: Hides the card

### Accessibility

- Steps and hand-offs are a list; each reads who, what, when and how long – "Coder, tool call, edit_file, from 0:17 for 5.5s"
- Waiting on you shows as words in the bar, not only as amber
- Every step names itself inside when there is room – the tool, what it thinks about, "Waiting on you"
- Focus rings show for the keyboard only (:focus-visible)

### Motion

- A new step glides up or down to its level, and back to the baseline when it ends; a running step grows to the now line and ends in a softly pulsing dot
- A hand-off – a dashed line straight to the other row – draws itself as now passes it, then a small white dot appears where it lands
- Every part is worked out from now, so it stays right however often it renders
- With prefers-reduced-motion the pulse and the twinkle stop; the steps still follow now

### Responsive

- The time axis fits the width – a tick about every 90px, in seconds, minutes or hours
- Narrow: the names and what they do become their pixel marks, the counts go under the title
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Use seconds from the start of the run for start, end, at and now
- Leave end out while a step runs, and set it when it's over – don't move start
- Give steps stable ids when they can start at the same second – the default id is who and start

### Requirements

- React 19

Related: agent-sequence, trace-waterfall, agent-lanes, agent-handoff
